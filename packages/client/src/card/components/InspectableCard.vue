<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  type HoverCardContentProps,
  type HoverCardRootProps
} from 'reka-ui';
import GameCard from '@/game/components/GameCard.vue';
import { useCard, useGameUi } from '@/game/composables/useGameClient';
import { isDefined } from '@game/shared';
import { getKeywordByIdOrAlias } from '@game/engine/src/card/card-keywords';
import { useFloating, offset } from '@floating-ui/vue';

defineOptions({
  inheritAttrs: false
});

const {
  cardId,
  side,
  sideOffset,
  align,
  closeDelay = 0,
  openDelay = 200,
  enabled = true,
  pixelScale = 2
} = defineProps<
  { cardId: string; enabled?: boolean; pixelScale?: number } & Pick<
    HoverCardContentProps,
    'side' | 'sideOffset' | 'align'
  > &
    Pick<HoverCardRootProps, 'openDelay' | 'closeDelay'>
>();

const ui = useGameUi();
const card = useCard(computed(() => cardId));
const keywords = computed(() => {
  if (!card.value) return [];
  const rawKeywordsInDescription = Array.from(
    card.value.description.matchAll(/<rt-keyword>(.*?)<\/rt-keyword>/g)
  ).map(match => match[1]);

  const keywords = rawKeywordsInDescription
    .map(id => getKeywordByIdOrAlias(id))
    .filter(isDefined);
  console.log(rawKeywordsInDescription, keywords);
  return keywords;
});

const reference = ref(null);
const floating = ref(null);
const { floatingStyles } = useFloating(reference, floating, {
  placement: 'right-start',
  middleware: [offset(10)],
  strategy: 'fixed'
});
</script>

<template>
  <HoverCardRoot :open-delay="openDelay" :close-delay="closeDelay">
    <HoverCardTrigger class="inspectable-card" v-bind="$attrs">
      <slot />
    </HoverCardTrigger>
    <HoverCardPortal to="#card-portal">
      <HoverCardContent :side="side" :side-offset="sideOffset" :align="align">
        <div
          ref="reference"
          v-if="!ui.draggedCard && !ui.selectedCard && enabled"
        >
          <GameCard
            :card-id="cardId"
            :interactive="false"
            :pixel-scale="pixelScale"
          />
          <ul ref="floating" :style="floatingStyles">
            <li v-for="keyword in keywords" :key="keyword.id">
              <div class="keyword-name">{{ keyword.name }}</div>
              {{ keyword.description }}
            </li>
          </ul>
        </div>
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
ul {
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
}
li {
  max-inline-size: calc(var(--card-v2-width) * var(--pixel-scale));
  background-color: hsla(0, 0%, 0%, 0.8);
  color: #efef9f;
  padding: var(--size-1) var(--size-3);
  font-family: var(--font-system-ui);
  font-size: 14px;
  border: solid 1px #bb8225;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.keyword-name {
  font-weight: var(--font-weight-7);
  margin-bottom: var(--size-1);
}
</style>
