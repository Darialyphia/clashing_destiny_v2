<script setup lang="ts">
import { useRichTextContext } from '@/game/composables/useRichText';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import {
  CARD_LOCATIONS,
  type CardLocation
} from '@game/engine/src/card/card.enums';
import { uppercaseFirstLetter } from '@game/shared';

const { locations, alwaysActive } = defineProps<{
  locations: string;
  alwaysActive?: boolean;
}>();

const ctx = useRichTextContext();

const locationsArray = computed(() => {
  return locations.split(',').map(r => r.trim()) as Array<
    CardLocation | 'battlefield'
  >;
});
// const isDisabled = computed(() => {
//   if (!ctx?.card?.value) return false;
//   if (alwaysActive) return false;
//   return !locationsArray.value.some(loc => {
//     if (loc === 'battlefield') {
//       return (
//         ctx.card.value?.location === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
//         ctx.card.value?.location === CARD_LOCATIONS.RIGHT_BATTLEFIELD
//       );
//     }
//     return ctx.card.value?.location === loc;
//   });
// });
</script>

<template>
  <span class="job-bonus">
    <UiSimpleTooltip>
      <template #trigger>
        <span class="badge">
          In {{ locations.toLocaleLowerCase().replaceAll(/,/g, ', ') }}
        </span>
      </template>

      Activates if this card is in your
      {{
        uppercaseFirstLetter(
          locations.toLocaleLowerCase().replaceAll(/,/g, ', ')
        )
      }}.
    </UiSimpleTooltip>
    <slot />
  </span>
</template>

<style scoped lang="postcss">
.badge {
  background: linear-gradient(
    to bottom,
    var(--yellow-5) 50%,
    var(--yellow-7) 50%
  );
  border: solid calc(0.5px * var(--pixel-scale)) var(--yellow-9);
  color: white;
  font-size: 0.95em;
  padding-inline: calc(4px * var(--pixel-scale));
  border-radius: var(--radius-pill);
  font-family: var(--font-system-ui);
  font-weight: var(--font-weight-5);
  -webkit-text-stroke: calc(1.5px * var(--pixel-scale)) black;
  paint-order: stroke fill;
  padding-bottom: calc(1px * var(--pixel-scale));
  margin-right: 1ch;
}

.disabled {
  opacity: 0.6;
  > .badge {
    background: var(--gray-4);
    border-color: var(--gray-6);
  }
}
</style>
