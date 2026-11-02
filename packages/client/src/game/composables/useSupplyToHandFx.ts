import gsap from 'gsap';
import type { MaybeRefOrGetter } from 'vue';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useSoundEffect } from '@/shared/composables/useSoundEffect';
import {
  useFxEvent,
  useGameClient,
  useGameState,
  useGameUi
} from './useGameClient';

const DURATION = 0.45;
const STAGGER = 0.08;
const FADE_RATIO = 0.4;

export const supplyToHandGhostSelector = (cardId: string) =>
  `[data-supply-to-hand-ghost="${cardId}"]`;

const handCardSelector = (playerId: string, cardId: string) =>
  `#hand-${playerId} [data-hand-card="${cardId}"]`;

// x / y / scale that center a fixed element positioned at 0,0 on a rect and match its width
const fitOnRect = (el: HTMLElement, rect: DOMRect) => ({
  x: rect.left + rect.width / 2 - el.offsetWidth / 2,
  y: rect.top + rect.height / 2 - el.offsetHeight / 2,
  scale: rect.width / el.offsetWidth
});

/**
 * Slides cards from a supply zone to the hand of `playerId`.
 * A ghost of the card is created on top of the supply card before it leaves the supply zone,
 * then flies to the card's slot in the hand, which stays hidden until the ghost lands on it.
 */
export const useSupplyToHandFx = (
  playerId: MaybeRefOrGetter<string>,
  options: { isFaceDownInHand: (card: CardViewModel) => boolean }
) => {
  const { client } = useGameClient();
  const state = useGameState();
  const ui = useGameUi();

  // each of these cards has a ghost flying to its slot in the hand
  const incomingCardIds = ref<string[]>([]);

  // during the draw phase, the whole supply of both players is recollected as one animation
  // instead of one card after the other
  let isRecollecting = false;

  const sound = useSoundEffect('whoosh3', {
    rateVariance: 0.05,
    throttle: 100
  });

  const isSupplyToHand = (event: { from: string | null; to: string }) =>
    event.from === CARD_LOCATIONS.SUPPLY && event.to === CARD_LOCATIONS.HAND;

  const findSupplyCardElement = (cardId: string) => {
    for (const id of state.value.players) {
      const el = document.querySelector<HTMLElement>(
        `${ui.value.DOMSelectors.supplyZone(id).selector} [id="${cardId}"]`
      );
      if (el) return el;
    }
    return null;
  };

  const getGhostElements = (cardId: string) => {
    const root = document.querySelector<HTMLElement>(
      supplyToHandGhostSelector(cardId)
    );
    if (!root) return null;
    return {
      small: root.querySelector<HTMLElement>('.ghost-small')!,
      big: root.querySelector<HTMLElement>('.ghost-big')!,
      faces: root.querySelector<HTMLElement>('.ghost-faces')!
    };
  };

  const flush = async () => {
    if (!incomingCardIds.value.length) return;

    // the hand needs to render the incoming cards to know where they land
    client.value.triggerStateUpdate();
    await nextTick();
    // processing the snapshot can keep the main thread busy for a while, starting the flight
    // on the next frame avoids skipping its beginning
    await new Promise(resolve => requestAnimationFrame(resolve));

    sound.value?.play();
    const tl = gsap.timeline();
    incomingCardIds.value.forEach((cardId, index) => {
      const els = getGhostElements(cardId);
      const target = document.querySelector<HTMLElement>(
        handCardSelector(toValue(playerId), cardId)
      );
      if (!els || !target) return;

      const to = target.getBoundingClientRect();
      const at = index * STAGGER;
      const ease = 'power2.inOut';

      // the small supply card morphs into the full size hand card while sliding
      tl.to(
        els.small,
        { ...fitOnRect(els.small, to), duration: DURATION, ease },
        at
      );
      tl.to(
        els.small,
        { autoAlpha: 0, duration: DURATION * FADE_RATIO, ease: 'power1.out' },
        at
      );
      tl.to(
        els.big,
        { ...fitOnRect(els.big, to), duration: DURATION, ease },
        at
      );
      tl.to(
        els.big,
        { autoAlpha: 1, duration: DURATION * FADE_RATIO, ease: 'power1.out' },
        at
      );

      const card = client.value.stateManager.getCard(cardId);
      if (card && options.isFaceDownInHand(card)) {
        tl.to(els.faces, { rotationY: 180, duration: DURATION, ease }, at);
      }
    });

    await tl;
    incomingCardIds.value = [];
  };

  // the ghosts must cover the supply cards before they get removed from the supply zone,
  // as the remaining supply cards would move to fill the gaps
  const createGhosts = async (cardIds: string[]) => {
    const sources = new Map<string, DOMRect>();
    for (const cardId of cardIds) {
      if (incomingCardIds.value.includes(cardId)) continue;
      const card = client.value.stateManager.getCard(cardId);
      if (card?.player.id !== toValue(playerId)) continue;
      const source = findSupplyCardElement(cardId);
      if (!source) continue;

      sources.set(cardId, source.getBoundingClientRect());
      incomingCardIds.value.push(cardId);
    }
    if (!sources.size) return;

    await nextTick();
    for (const [cardId, from] of sources) {
      const els = getGhostElements(cardId);
      if (!els) continue;
      gsap.set(els.small, { ...fitOnRect(els.small, from), autoAlpha: 1 });
      gsap.set(els.big, { ...fitOnRect(els.big, from), autoAlpha: 0 });
      gsap.set(els.faces, { rotationY: 0, transformPerspective: 800 });
    }
  };

  useFxEvent(FX_EVENTS.BEFORE_RECOLLECT_SUPPLY, async event => {
    isRecollecting = true;
    await createGhosts(event.cards);
  });

  useFxEvent(FX_EVENTS.AFTER_RECOLLECT_SUPPLY, async () => {
    isRecollecting = false;
    await flush();
  });

  useFxEvent(FX_EVENTS.CARD_BEFORE_CHANGE_LOCATION, async event => {
    if (!isSupplyToHand(event)) return;
    await createGhosts([event.card]);
  });

  useFxEvent(FX_EVENTS.CARD_AFTER_CHANGE_LOCATION, async event => {
    if (!isSupplyToHand(event) || isRecollecting) return;
    await flush();
  });

  return { incomingCardIds };
};
