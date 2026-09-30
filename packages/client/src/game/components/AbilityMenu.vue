<script setup lang="ts">
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import CardText from '@/card/components/CardText.vue';
import { isDefined } from '@game/shared';
import { type PopoverContentProps } from 'reka-ui';
import { useGameUi, useMyPlayer } from '../composables/useGameClient';

const { card, actionsSide = 'bottom' } = defineProps<{
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

const myPlayer = useMyPlayer();
</script>

<template>
  <div class="abilities-list" v-if="myPlayer.equals(card.player)">
    <UiSimpleTooltip
      v-for="ability in abilities"
      :key="ability.id"
      :side="actionsSide"
      :side-offset="15"
      :delay="0"
      :disabled="isDefined(ui.selectedCard)"
    >
      <template #trigger>
        <button
          class="ability"
          :disabled="!ability.predicate()"
          @mousedown.stop
          @click="
            () => {
              ability.handler(card);
            }
          "
        />
      </template>
      <div class="ability-tooltip">
        <CardText :text="ability.getLabel()" />
        <p v-if="ability.unusableReason" class="unusable-reason">
          {{ ability.unusableReason }}
        </p>
      </div>
    </UiSimpleTooltip>
  </div>
</template>

<style scoped lang="postcss">
.abilities-list {
  display: flex;
  gap: var(--size-2);
}
.ability {
  width: 32px;
  aspect-ratio: 1;
  background: url('@/assets/ui/card/v3/ability.png');
  background-size: cover;
  transition: filter 0.2s;
  &:hover {
    filter: drop-shadow(0 0 2px white) brightness(150%);
  }
  &:disabled {
    background: url('@/assets/ui/card/v3/ability-disabled.png') no-repeat
      center/cover;
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

.unusable-reason {
  font-size: var(--size-2);
  font-weight: var(--font-weight-5);
  -webkit-text-stroke: 3px black;
  paint-order: stroke fill;
  color: var(--red-5);
}
</style>
