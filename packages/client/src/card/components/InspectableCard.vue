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
import {
  useCard,
  useGameClient,
  useGameUi
} from '@/game/composables/useGameClient';
import { useFloating, offset } from '@floating-ui/vue';
import type { ModifierViewModel } from '@game/engine/src/client/view-models/modifier.model';
import { gameStateRef } from '@/game/composables/gameStateRef';
import { assets } from '@/assets';

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
const { playerId } = useGameClient();
const card = useCard(computed(() => cardId));

const visibleModifiers = gameStateRef(() => {
  const raw =
    card.value.modifiers.filter(
      modifier => modifier.name && modifier.description && modifier.stacks > 0
    ) ?? [];

  const result: Array<{
    key: string;
    playerId: string;
    totalStacks: number;
    icon?: string;
    name: string;
    description: string;
    sources: ModifierViewModel['source'][];
  }> = [];
  raw.forEach(modifier => {
    let group = result.find(
      g =>
        g.key === modifier.groupKey && g.playerId === modifier.source.player.id
    );
    if (!group) {
      group = {
        key: modifier.groupKey,
        playerId: modifier.source.player.id,
        totalStacks: 0,
        icon: modifier.icon,
        name: modifier.name!,
        description: modifier.description!,
        sources: [modifier.source]
      };
      result.push(group);
    } else {
      group.sources.push(modifier.source);
    }
    group.totalStacks += modifier.stacks;
  });
  return result;
});

const reference = ref(null);
const floating = ref(null);
const { floatingStyles } = useFloating(reference, floating, {
  placement: 'right-start',
  middleware: [offset(10)],
  strategy: 'fixed'
});

const isInspectable = computed(() => {
  if (ui.value.draggedCard) return false;
  if (ui.value.selectedCard) return false;
  if (!enabled) return false;
  if (card.value.player.id !== playerId.value && !card.value.isRevealed) {
    return false;
  }

  return true;
});
</script>

<template>
  <HoverCardRoot :open-delay="openDelay" :close-delay="closeDelay">
    <HoverCardTrigger as-child>
      <div class="inspectable-card" v-bind="$attrs">
        <slot />
      </div>
    </HoverCardTrigger>
    <HoverCardPortal to="#card-portal">
      <HoverCardContent :side="side" :side-offset="sideOffset" :align="align">
        <div ref="reference" v-if="isInspectable">
          <GameCard
            :card-id="cardId"
            :interactive="false"
            :pixel-scale="pixelScale"
          />
          <ul ref="floating" :style="floatingStyles">
            <!-- <li v-for="keyword in keywords" :key="keyword.id">
              <div class="keyword-name">{{ keyword.name }}</div>
              {{ keyword.description }}
            </li> -->
            <li
              v-for="group in visibleModifiers"
              :key="group.key"
              class="modifier-tooltip surface-transparent"
            >
              <div class="modifier-header">
                <div
                  v-if="group.icon"
                  class="modifier-icon"
                  :style="{ '--bg': assets[group.icon!]?.css }"
                />
                <div class="modifier-name">{{ group.name }}</div>
              </div>
              <div
                class="modifier-description"
                :class="{
                  ally: group.playerId === playerId,
                  enemy: group.playerId !== playerId
                }"
              >
                {{ group.description }}
              </div>
              <div class="modifier-source">
                Sources:
                {{ group.sources.map(source => source.name).join(' / ') }}
              </div>
            </li>
          </ul>
        </div>
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
.inspectable-card {
  transform-style: preserve-3d;
}
ul {
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
}
li {
  max-inline-size: calc(var(--card-v2-width) * var(--pixel-scale));
  background-color: hsla(0, 0%, 0%, 0.65);
  backdrop-filter: blur(4px);
  color: #efef9f;
  /* padding: var(--size-1) var(--size-3); */
  font-family: 'Lato';
  font-size: 12px;
  /* border: solid 1px #bb8225; */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.keyword-name {
  font-weight: var(--font-weight-7);
  margin-bottom: var(--size-1);
}

.modifier-tooltip {
  display: flex;
  flex-direction: column;
  color: #efef9f;
}

.modifier-header {
  display: flex;
  align-items: flex-end;
  gap: var(--size-2);
}

.modifier-icon {
  width: 24px;
  aspect-ratio: 1;
  background: var(--bg) no-repeat center center;
  background-size: cover;
  flex-shrink: 0;
}

.modifier-name {
  font-weight: var(--font-weight-7);
  font-size: 16px;
  text-transform: uppercase;
}

.modifier-description {
  font-size: var(--font-size-0);
  line-height: 1.4;
  margin-block-end: var(--size-2);
}

.modifier-source {
  font-size: var(--font-size-00);
  color: #bb8225;
  padding-top: var(--size-1);
  border-top: 1px solid #bb8225;
  font-style: italic;
}
</style>
