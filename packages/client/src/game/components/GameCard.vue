<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { useCard, useGameClient } from '../composables/useGameClient';
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

const { cardId, interactive = true } = defineProps<{
  cardId: string;
  interactive?: boolean;
}>();

const card = useCard(cardId);

const root = useTemplateRef('root');

const scale = ref(1);
const calculateScale = () => {
  if (!root.value) return;
  const availableWidth = root.value.parentElement?.offsetWidth || 0;
  const availableHeight = root.value.parentElement?.offsetHeight || 0;
  const width = root.value.offsetWidth;
  const height = root.value.offsetHeight;

  const scaleX = availableWidth / width;
  const scaleY = availableHeight / height;
  scale.value = Math.min(scaleX, scaleY);
};

useResizeObserver(root, calculateScale);
onMounted(calculateScale);

const client = useGameClient();

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
</script>

<template>
  <div
    class="card-resizer"
    ref="root"
    :class="{
      disabled: !card.canPlay && card.location === 'hand',
      selected: client.ui.selectedCard?.equals(card)
    }"
    v-on-click-outside="
      () => {
        isActionsPopoverOpened = false;
      }
    "
  >
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
        @click="
          () => {
            if (!interactive) return;
            client.ui.onCardClick(card);
          }
        "
      />
      <PopoverContent>
        <div class="flex flex-col">
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
    </PopoverRoot>
  </div>
</template>

<style scoped lang="postcss">
.card-resizer {
  transform: scale(v-bind(scale));
  transform-origin: top left;
  position: relative;
}

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
</style>
