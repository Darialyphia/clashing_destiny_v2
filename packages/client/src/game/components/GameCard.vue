<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import {
  useCard,
  useGameClient,
  useGameState
} from '../composables/useGameClient';
import Card from '@/card/components/Card.vue';
import {
  PopoverRoot,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent
} from 'reka-ui';
import CardText from '@/card/components/CardText.vue';
import CardResizer from './CardResizer.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { COMBAT_STEPS } from '@game/engine/src/game/phases/combat.phase';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { isDefined } from '@game/shared';

const {
  cardId,
  interactive = true,
  autoScale = true
} = defineProps<{
  cardId: string;
  interactive?: boolean;
  autoScale?: boolean;
}>();

const card = useCard(computed(() => cardId));

const client = useGameClient();
const state = useGameState();
const isActionsPopoverOpened = computed({
  get() {
    if (!client.value.ui.selectedCard) return false;
    return client.value.ui.selectedCard.equals(card.value);
  },
  set(value) {
    if (value) {
      client.value.ui.select(card.value);
    } else {
      client.value.ui.unselect();
    }
  }
});

const isTargetable = computed(() => {
  if (!interactive) return false;

  const canSelect =
    state.value.interaction.state ===
      INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
    state.value.interaction.ctx.elligibleCards.some(id => id === cardId);

  const canAttack =
    state.value.interaction.state === INTERACTION_STATES.IDLE &&
    state.value.phase.state === GAME_PHASES.ATTACK &&
    state.value.phase.ctx.step === COMBAT_STEPS.DECLARE_TARGET &&
    state.value.phase.ctx.potentialTargets.some(id => id === cardId);

  return canSelect || canAttack;
});

const shouldDisplayStats = computed(() => {
  if (!interactive) return false;
  if (card.value.location !== 'board') return false;
  return (
    card.value.kind === CARD_KINDS.HERO ||
    card.value.kind === CARD_KINDS.MINION ||
    card.value.kind === CARD_KINDS.ARTIFACT
  );
});
</script>

<template>
  <CardResizer :enabled="autoScale" class="game-card">
    <PopoverRoot v-model:open="isActionsPopoverOpened">
      <PopoverAnchor />
      <Card
        :id="card.id"
        :card="{
          id: card.id,
          name: card.name,
          affinity: card.affinity,
          description: card.description,
          image: card.imagePath,
          kind: card.kind,
          level: card.level,
          rarity: card.rarity,
          manaCost: card.manaCost,
          destinyCost: card.destinyCost,
          atk: card.atk,
          hp: card.hp,
          spellpower: card.spellpower,
          durability: card.durability,
          subKind: card.subKind,
          uinlockableAffinities: card.unlockableAffinities,
          abilities: card.abilities.map(ability => ability.description)
        }"
        class="card"
        :class="{
          floating: card.location === 'board',
          exhausted: card.isExhausted,
          disabled: !card.canPlay && card.location === 'hand',
          selected: client.ui.selectedCard?.equals(card),
          targetable: isTargetable
        }"
        @click="
          () => {
            if (!interactive) return;
            client.ui.onCardClick(card);
          }
        "
      />
      <div
        v-if="shouldDisplayStats"
        class="stats"
        :class="{ flipped: card.getPlayer().id !== client.playerId }"
      >
        <div class="atk" v-if="isDefined(card.atk)">{{ card.atk }}</div>
        <div class="spellpower" v-if="isDefined(card.spellpower)">
          {{ card.spellpower }}
        </div>
        <div class="hp" v-if="isDefined(card.hp)">{{ card.hp }}</div>
      </div>
      <PopoverPortal :disabled="card.location === 'hand'">
        <PopoverContent :side-offset="-50" v-if="interactive">
          <div class="actions-list">
            <button
              v-for="action in card.getActions()"
              :key="action.id"
              class="action"
              @click="
                () => {
                  action.handler(card);
                  isActionsPopoverOpened = false;
                }
              "
            >
              <CardText :text="action.getLabel(card)" />
            </button>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </CardResizer>
</template>

<style scoped lang="postcss">
@keyframes card-glow {
  0%,
  80%,
  100% {
    box-shadow: 0 0 10px hsl(var(--glow-hsl) / 0.25);
  }
  40% {
    box-shadow: 0 0 30px hsl(var(--glow-hsl) / 0.75);
  }
}

.game-card {
  --pixel-scale: 2;
  --floating-amount: 10px;
  width: calc(var(--card-width) * var(--pixel-scale));
  height: calc(var(--card-height) * var(--pixel-scale));
}

.disabled {
  filter: grayscale(0.75);
}

.selected {
  outline: solid 3px cyan;
}

.highlighted::after {
  content: '';
  position: absolute;
  inset: 0;
  --glow-hsl: var(--cyan-4-hsl);
  animation: card-glow 2.5s infinite;
}

.actions-list {
  display: flex;
  flex-direction: column;
}
.action {
  background: black;
  padding: 0.5rem;
  min-width: 10rem;
  text-align: left;
  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: solid 2px hsl(var(--cyan-4-hsl));
  }
}

.card {
  transition: all 0.3s var(--ease-2);
  &.floating {
    transform: translateZ(var(--floating-amount));
  }
  &.exhausted {
    filter: grayscale(0.5);
    transform: none;
  }
  &.targetable {
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: hsl(200 100% 50% / 0.25);
    }
  }
}

.stats {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, hsl(0 0 0 / 0.5));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  padding: var(--size-3);
  font-size: var(--font-size-10);
  font-weight: var(--font-weight-9);
  line-height: 1;
  pointer-events: none;

  &.flipped {
    rotate: 180deg;
    justify-content: flex-start;
  }
  .game-card:has(.card.floating) & {
    transform: translateZ(var(--floating-amount));
  }

  .atk {
    background-image: url('/assets/ui/attack.png');
    background-position: left center;
    background-size: 60px;
    padding-left: var(--size-10);
  }

  .spellpower {
    background-image: url('/assets/ui/ability-power.png');
    background-position: left center;
    background-size: 60px;
    padding-left: var(--size-10);
  }

  .hp {
    background-image: url('/assets/ui/hp.png');
    background-position: left center;
    background-size: 60px;
    padding-left: var(--size-10);
  }
}
</style>
