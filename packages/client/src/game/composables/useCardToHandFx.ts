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

export type CardToHandSource = 'supply' | 'deck';

export type IncomingCard = {
  cardId: string;
  source: CardToHandSource;
  // the opponent's drawn cards are not sent to the client, so their ghost only has a back
  hasFront: boolean;
};

export const cardToHandGhostSelector = (cardId: string) =>
  `[data-card-to-hand-ghost="${cardId}"]`;

const handCardSelector = (playerId: string, cardId: string) =>
  `#hand-${playerId} [data-hand-card="${cardId}"]`;

// x / y / scale that center a fixed element positioned at 0,0 on a rect and match its width
const fitOnRect = (el: HTMLElement, rect: DOMRect) => ({
  x: rect.left + rect.width / 2 - el.offsetWidth / 2,
  y: rect.top + rect.height / 2 - el.offsetHeight / 2,
  scale: rect.width / el.offsetWidth
});

/**
 * Slides cards from a supply zone or the main deck to the hand of `playerId`.
 * A ghost of the card is created on top of its source before it leaves it,
 * then flies to the card's slot in the hand, which stays hidden until the ghost lands on it.
 */
export const useCardToHandFx = (
  playerId: MaybeRefOrGetter<string>,
  options: { isFaceDownInHand: (card: CardViewModel) => boolean }
) => {
  const { client } = useGameClient();
  const state = useGameState();
  const ui = useGameUi();

  // each of these cards has a ghost flying to its slot in the hand
  const incomingCards = ref<IncomingCard[]>([]);
  const incomingCardIds = computed(() =>
    incomingCards.value.map(card => card.cardId)
  );

  // cards moved during a batch (recollecting the supply, drawing several cards...)
  // fly together once the outermost batch ends instead of one after the other
  let batchDepth = 0;

  const sound = useSoundEffect('whoosh3', {
    rateVariance: 0.05,
    throttle: 100
  });

  const getSource = (event: {
    from: string | null;
    to: string;
  }): CardToHandSource | null => {
    if (event.to !== CARD_LOCATIONS.HAND) return null;
    if (event.from === CARD_LOCATIONS.SUPPLY) return 'supply';
    if (event.from === CARD_LOCATIONS.MAIN_DECK) return 'deck';
    return null;
  };

  const findSupplyCardElement = (cardId: string) => {
    for (const id of state.value.players) {
      const el = document.querySelector<HTMLElement>(
        `${ui.value.DOMSelectors.supplyZone(id).selector} [id="${cardId}"]`
      );
      if (el) return el;
    }
    return null;
  };

  const findDeck = () => {
    const deck = ui.value.DOMSelectors.mainDeck(toValue(playerId)).element;
    const topCard = deck?.querySelector<HTMLElement>('.pile-item:last-child');
    if (!deck || !topCard) return null;
    return {
      topCard,
      rotation: parseFloat(getComputedStyle(deck).rotate) || 0
    };
  };

  const getGhostElements = (cardId: string) => {
    const root = document.querySelector<HTMLElement>(
      cardToHandGhostSelector(cardId)
    );
    if (!root) return null;
    return {
      small: root.querySelector<HTMLElement>('.ghost-small'),
      big: root.querySelector<HTMLElement>('.ghost-big')!,
      faces: root.querySelector<HTMLElement>('.ghost-faces')!
    };
  };

  const isFaceDownInHand = (cardId: string) => {
    const card = client.value.stateManager.getCard(cardId);
    return !card || options.isFaceDownInHand(card);
  };

  const flush = async () => {
    if (!incomingCards.value.length) return;

    // the hand needs to render the incoming cards to know where they land
    client.value.triggerStateUpdate();
    await nextTick();
    // processing the snapshot can keep the main thread busy for a while, starting the flight
    // on the next frame avoids skipping its beginning
    await new Promise(resolve => requestAnimationFrame(resolve));

    sound.value?.play();
    const tl = gsap.timeline();
    const ease = 'power2.inOut';
    incomingCards.value.forEach(({ cardId, source }, index) => {
      const els = getGhostElements(cardId);
      const target = document.querySelector<HTMLElement>(
        handCardSelector(toValue(playerId), cardId)
      );
      if (!els || !target) return;

      const to = target.getBoundingClientRect();
      const at = index * STAGGER;

      tl.to(
        els.big,
        { ...fitOnRect(els.big, to), rotation: 0, duration: DURATION, ease },
        at
      );
      tl.to(
        els.faces,
        {
          rotationY: isFaceDownInHand(cardId) ? 180 : 0,
          duration: DURATION,
          ease
        },
        at
      );

      // the small supply card morphs into the full size hand card while sliding
      if (source === 'supply' && els.small) {
        tl.to(
          els.small,
          { ...fitOnRect(els.small, to), duration: DURATION, ease },
          at
        );
        tl.to(
          els.small,
          {
            autoAlpha: 0,
            duration: DURATION * FADE_RATIO,
            ease: 'power1.out'
          },
          at
        );
        tl.to(
          els.big,
          {
            autoAlpha: 1,
            duration: DURATION * FADE_RATIO,
            ease: 'power1.out'
          },
          at
        );
      }
    });

    await tl;
    incomingCards.value = [];
  };

  // the ghosts must cover their source before the cards leave it,
  // as the remaining supply cards would move to fill the gaps
  const createGhosts = async (
    cards: Array<{ cardId: string; playerId: string; source: CardToHandSource }>
  ) => {
    const placements: Array<() => void> = [];
    for (const { cardId, source, ...card } of cards) {
      if (card.playerId !== toValue(playerId)) continue;
      if (incomingCardIds.value.includes(cardId)) continue;

      if (source === 'supply') {
        const el = findSupplyCardElement(cardId);
        if (!el) continue;
        const from = el.getBoundingClientRect();
        placements.push(() => {
          const els = getGhostElements(cardId);
          if (!els?.small) return;
          gsap.set(els.small, { ...fitOnRect(els.small, from), autoAlpha: 1 });
          gsap.set(els.big, { ...fitOnRect(els.big, from), autoAlpha: 0 });
          gsap.set(els.faces, { rotationY: 0, transformPerspective: 800 });
        });
      } else {
        const deck = findDeck();
        if (!deck) continue;
        const from = deck.topCard.getBoundingClientRect();
        const width = deck.topCard.offsetWidth;
        placements.push(() => {
          const els = getGhostElements(cardId);
          if (!els) return;
          // the deck card is rotated, so its bounding rect can't give its size
          gsap.set(els.big, {
            ...fitOnRect(els.big, from),
            scale: width / els.big.offsetWidth,
            rotation: deck.rotation,
            autoAlpha: 1
          });
          gsap.set(els.faces, { rotationY: 180, transformPerspective: 800 });
        });
      }

      incomingCards.value.push({
        cardId,
        source,
        hasFront: !!client.value.stateManager.getCard(cardId)
      });
    }
    if (!placements.length) return;

    await nextTick();
    placements.forEach(place => place());
  };

  const startBatch = () => {
    batchDepth++;
  };
  const endBatch = async () => {
    batchDepth = Math.max(0, batchDepth - 1);
    if (batchDepth === 0) await flush();
  };

  useFxEvent(FX_EVENTS.BEFORE_RECOLLECT_SUPPLY, async event => {
    startBatch();
    await createGhosts(
      event.cards.map(cardId => ({
        cardId,
        playerId: client.value.stateManager.getCard(cardId)?.player.id ?? '',
        source: 'supply'
      }))
    );
  });
  useFxEvent(FX_EVENTS.AFTER_RECOLLECT_SUPPLY, endBatch);

  useFxEvent(FX_EVENTS.BEFORE_DRAW_FOR_TURN, startBatch);
  useFxEvent(FX_EVENTS.AFTER_DRAW_FOR_TURN, endBatch);

  useFxEvent(FX_EVENTS.PLAYER_BEFORE_DRAW, startBatch);
  useFxEvent(FX_EVENTS.PLAYER_AFTER_DRAW, endBatch);

  useFxEvent(FX_EVENTS.CARD_BEFORE_CHANGE_LOCATION, async event => {
    const source = getSource(event);
    if (!source) return;
    await createGhosts([
      { cardId: event.card, playerId: event.player, source }
    ]);
  });

  useFxEvent(FX_EVENTS.CARD_AFTER_CHANGE_LOCATION, async event => {
    if (!getSource(event) || batchDepth > 0) return;
    await flush();
  });

  return { incomingCards, incomingCardIds };
};
