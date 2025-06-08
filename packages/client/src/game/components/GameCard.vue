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
import { vOnClickOutside } from '@vueuse/components';
import FancyButton from '@/ui/components/FancyButton.vue';
import CardText from '@/card/components/CardText.vue';
import CardResizer from './CardResizer.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';

const {
  cardId,
  interactive = true,
  autoScale = true
} = defineProps<{
  cardId: string;
  interactive?: boolean;
  autoScale?: boolean;
}>();

const card = useCard(cardId);

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
  return (
    interactive &&
    state.value.interaction.state ===
      INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
    state.value.interaction.ctx.elligibleCards.some(id => id === cardId)
  );
});
</script>

<template>
  <CardResizer :enabled="autoScale">
    <PopoverRoot v-model:open="isActionsPopoverOpened">
      <PopoverAnchor />
      <Card
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
    transform: translateZ(10px);
  }
  &.exhausted {
    filter: grayscale(0.5);
    transform: none;
  }
  &.targetable {
    filter: sepia(0.5) hue-rotate(180deg);
  }
}
</style>
