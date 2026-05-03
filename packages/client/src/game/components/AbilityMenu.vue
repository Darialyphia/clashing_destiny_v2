<script setup lang="ts">
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import CardText from '@/card/components/CardText.vue';
import { isDefined } from '@game/shared';
import { type PopoverContentProps } from 'reka-ui';
import { useGameUi } from '../composables/useGameClient';

const { card } = defineProps<{
  card: CardViewModel;
  usePortal?: boolean;
  actionsOffset?: number;
  portalTarget?: string;
  actionsSide?: PopoverContentProps['side'];
  actionsAlign?: PopoverContentProps['align'];
}>();

const abilities = computed(() => {
  if (!card) return [];
  return card.abilityActions;
});

const ui = useGameUi();
</script>

<template>
  <div class="abilities-list">
    <UiSimpleTooltip
      v-for="ability in abilities"
      :key="ability.id"
      side="bottom"
      :side-offset="15"
      :delay="0"
      :disabled="isDefined(ui.selectedCard)"
    >
      <template #trigger>
        <button
          class="ability"
          :disabled="!ability.predicate()"
          @mousedown.stop
          @click="ability.handler(card)"
        />
      </template>
      <div class="ability-tooltip">
        <CardText :text="ability.getLabel()" />
      </div>
    </UiSimpleTooltip>
  </div>
</template>

<style scoped lang="postcss">
.abilities-list {
  display: flex;
  flex-direction: column;
}
.ability {
  width: 16px;
  aspect-ratio: 1;
  background: url('@/assets/ui/card/ability.png') no-repeat center/contain;
  transition: filter 0.2s;
  &:hover {
    filter: drop-shadow(0 0 2px white) brightness(150%);
  }
  &:disabled {
    background: url('@/assets/ui/card/ability-disabled.png');
  }
}

.ability-tooltip {
  --card-text-color: #d1c6c2;
}
p {
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;
  text-shadow:
    0 0 2px black,
    0 0 1px black;
}
</style>
