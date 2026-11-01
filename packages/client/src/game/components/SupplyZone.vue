<script setup lang="ts">
import gsap from 'gsap';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const { player } = defineProps<{ player: PlayerViewModel }>();

const state = useGameState();
const { client } = useGameClient();
const myPlayer = useMyPlayer();
const ui = useGameUi();

const canSupply = computed(() => {
  if (!myPlayer.value.equals(player)) return false;
  if (state.value.phase.state !== GAME_PHASES.PLAY_CARD) return false;
  const interaction = state.value.interaction;
  if (
    interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
    interaction.ctx.selectedCards.length
  ) {
    return false;
  }
  if (
    interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD &&
    interaction.ctx.selectedSpaces.length
  ) {
    return false;
  }
  return true;
});

const onMouseup = (event: MouseEvent) => {
  if (!canSupply.value) return;
  event.stopPropagation();
  client.value.supplyCard();
};

const isHovered = ref(false);
const onMouseenter = () => {
  isHovered.value = true;
};

const onMouseleave = () => {
  isHovered.value = false;
};

const SPARK_COUNT = 10;
const GLOW_COLOR = '255, 212, 59';

// .player-mana relies on the CSS `scale` property, which gsap would fold into its own transform,
// so we pulse an inner wrapper instead
const manaPulseEl = useTemplateRef('manaPulse');

const onCardEnter = (el: Element, done: () => void) => {
  const card = el as HTMLElement;
  const ring = card.querySelector('.supply-card-ring');
  const sparks = card.querySelectorAll<HTMLElement>('.supply-card-spark');

  const tl = gsap.timeline({
    onComplete() {
      gsap.set(card, { clearProps: 'transform,filter,opacity,visibility' });
      done();
    }
  });

  // slam down onto the zone
  tl.fromTo(
    card,
    {
      y: -60,
      scale: 1.8,
      rotation: gsap.utils.random(-15, 15),
      autoAlpha: 0,
      filter: `brightness(3) drop-shadow(0 0 0px rgba(${GLOW_COLOR}, 0))`
    },
    {
      y: 0,
      scale: 1,
      rotation: 0,
      autoAlpha: 1,
      filter: `brightness(2) drop-shadow(0 0 14px rgba(${GLOW_COLOR}, 1))`,
      duration: 0.35,
      ease: 'power3.in'
    }
  );
  tl.addLabel('impact');

  // squash on impact, then wobble back into shape
  tl.to(
    card,
    { scaleX: 1.15, scaleY: 0.85, duration: 0.07, ease: 'power1.out' },
    'impact'
  );
  tl.to(card, {
    scaleX: 1,
    scaleY: 1,
    duration: 0.6,
    ease: 'elastic.out(1.2, 0.35)'
  });
  tl.to(
    card,
    {
      filter: `brightness(1) drop-shadow(0 0 0px rgba(${GLOW_COLOR}, 0))`,
      duration: 0.7,
      ease: 'power2.out'
    },
    'impact+=0.1'
  );

  // the fx below would otherwise render their starting state while the card is still falling
  tl.fromTo(
    ring,
    { scale: 0.9, autoAlpha: 1 },
    {
      scale: 1.8,
      autoAlpha: 0,
      duration: 0.55,
      ease: 'power2.out',
      immediateRender: false
    },
    'impact'
  );

  // sparks burst outwards from the card's edges
  const halfWidth = card.offsetWidth / 2;
  const halfHeight = card.offsetHeight / 2;
  sparks.forEach(spark => {
    const angle = gsap.utils.random(0, Math.PI * 2);
    const distance = gsap.utils.random(30, 70);
    const startX = Math.cos(angle) * halfWidth;
    const startY = Math.sin(angle) * halfHeight;
    tl.fromTo(
      spark,
      {
        x: startX,
        y: startY,
        rotation: (angle * 180) / Math.PI,
        scaleX: gsap.utils.random(1, 1.8),
        scaleY: 1,
        autoAlpha: 1
      },
      {
        x: startX + Math.cos(angle) * distance,
        y: startY + Math.sin(angle) * distance,
        scaleX: 0,
        scaleY: 0.5,
        autoAlpha: 0,
        duration: gsap.utils.random(0.4, 0.7),
        ease: 'power3.out',
        immediateRender: false
      },
      'impact'
    );
  });

  if (manaPulseEl.value) {
    tl.to(
      manaPulseEl.value,
      {
        scale: 1.5,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      },
      'impact'
    );
  }
};
</script>

<template>
  <div
    v-if="ui.displayedElements.supplyZone"
    class="supply-zone"
    :class="{ hoverable: canSupply, hovered: isHovered }"
    :id="ui.DOMSelectors.supplyZone(player.id).id"
    @mouseup="onMouseup"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
  >
    <div class="player-mana" :id="ui.DOMSelectors.currentMana(player.id).id">
      <div ref="manaPulse">
        <rt-mana>{{ player.mana }}</rt-mana>
      </div>
    </div>
    <TransitionGroup :css="false" @enter="onCardEnter">
      <div v-for="card in player.supplyZone" :key="card.id" class="supply-card">
        <div class="supply-card-ring" />
        <InspectableCard :card-id="card.id" side="top" align="center">
          <GameCard :card-id="card.id" variant="small" />
        </InspectableCard>
        <span v-for="i in SPARK_COUNT" :key="i" class="supply-card-spark" />
      </div>
    </TransitionGroup>

    <transition>
      <div
        class="supply-indicator"
        v-if="canSupply && ui.selectedCard && isHovered"
      >
        +
        {{ ui.selectedCard.manaSupply }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
.supply-zone {
  width: 350px;
  position: relative;
  height: var(--card-small-v3-height);
  transition: box-shadow 0.3s var(--ease-2);
  display: flex;
  align-items: center;

  &.hoverable {
    --shadow-color: var(--orange-4);
    filter: drop-shadow(0 0 6px var(--shadow-color));
    box-shadow: 0 0px 20px 0 var(--shadow-color);

    &:hover {
      --shadow-color: var(--yellow-2);
    }
  }
}

.supply-card {
  position: absolute;
  top: 0;
  left: calc(10px + (var(--child-index) - 1) * 50px);
  isolation: isolate;
}

.supply-card-ring {
  position: absolute;
  inset: 0;
  z-index: -1;
  border: solid 3px var(--yellow-3);
  border-radius: var(--radius-2);
  box-shadow:
    0 0 12px var(--yellow-4),
    inset 0 0 12px var(--yellow-4);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}

.supply-card-spark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 4px;
  margin: -2px 0 0 -7px;
  background: white;
  box-shadow:
    0 0 4px 1px var(--yellow-3),
    0 0 8px 2px var(--orange-5);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}

.player-mana {
  font-size: 10px;
  scale: 3;
  translate: -15px 0;
  & * {
    -webkit-text-stroke: 2px black !important;
  }
}

.supply-indicator {
  position: absolute;
  top: 0;
  left: -25px;
  font-weight: var(--font-weight-9);
  font-size: 32px;
  color: var(--green-5);
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  transform: translateY(-50px);

  &.v-enter-active,
  &.v-leave-active {
    transition:
      opacity 0.3s var(--ease-2),
      transform 0.3s var(--ease-2);
  }
  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
    transform: translateY(0);
  }
}
</style>
