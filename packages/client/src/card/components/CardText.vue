<script setup lang="ts">
import { isString } from '@game/shared';
import {
  HoverCardRoot,
  HoverCardContent,
  HoverCardTrigger,
  HoverCardPortal
} from 'reka-ui';
import { KEYWORDS, type Keyword } from '@game/engine/src/card/card-keywords';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import BlueprintCard from './BlueprintCard.vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { CARD_SPEED, type CardSpeed } from '@game/engine/src/card/card.enums';
import { assets } from '@/assets';
import { useIsKeyboardControlPressed } from '@/shared/composables/useKeyboardControl';

const { text, highlighted = true } = defineProps<{
  text: string;
  highlighted?: boolean;
}>();

const KEYWORD_DELIMITER = '@';

type Token =
  | { type: 'text'; text: string }
  | { type: 'keyword'; text: string; keyword: Keyword }
  | { type: 'card'; card: CardBlueprint; text: string }
  | { type: 'exhaust' }
  | { type: 'mana'; text: string }
  | { type: 'destiny'; text: string }
  | { type: 'spellpower' }
  | { type: 'health' }
  | { type: 'attack' }
  | { type: 'dynamic-value'; text: string }
  | { type: 'level-bonus'; text: string }
  | { type: 'lineage-bonus'; text: string }
  | { type: 'missing-affinity'; text: string }
  | { type: 'durability' }
  | { type: CardSpeed }
  | { type: 'dynamic'; text: string; tooltipText: string };
const tokens = computed<Token[]>(() => {
  if (!text.includes(KEYWORD_DELIMITER)) return [{ type: 'text', text }];

  return text.split(KEYWORD_DELIMITER).map(part => {
    const keyword = Object.values(KEYWORDS).find(keyword => {
      if (part.startsWith('[')) return false;
      return (
        part
          .toLowerCase()
          .match(new RegExp(`^${keyword.name.toLowerCase()}$`)) ||
        keyword.aliases.some(alias => {
          return isString(alias)
            ? part.toLowerCase().match(alias.toLowerCase())
            : part.toLowerCase().match(alias);
        })
      );
    });

    if (keyword) return { type: 'keyword', text: part, keyword };
    const card = Object.values(CARDS_DICTIONARY).find(c => {
      return c.name === part;
    });
    if (card) {
      return {
        type: 'card',
        text: part,
        card: card
      };
    }
    if (part === '[exhaust]') return { type: 'exhaust' };
    if (part.startsWith('[mana]')) {
      return { type: 'mana', text: part.replace('[mana] ', '') };
    }
    if (part.startsWith('[destiny]')) {
      return { type: 'destiny', text: part.replace('[destiny] ', '') };
    }
    if (part.startsWith('[value]')) {
      return { type: 'dynamic-value', text: part.replace('[value] ', '') };
    }
    if (part.startsWith('[spellpower]')) {
      return { type: 'spellpower' };
    }
    if (part.startsWith('[hp]')) {
      return { type: 'health' };
    }
    if (part.startsWith('[atk]')) {
      return { type: 'attack' };
    }
    if (part.startsWith('[dur]')) {
      return { type: 'durability' };
    }
    if (part.startsWith('[lvl]')) {
      return {
        type: 'level-bonus',
        text: part.replace('[lvl] ', 'Level ')
      };
    }
    if (part.startsWith('[lineage]')) {
      return {
        type: 'lineage-bonus',
        text: part.replace('[lineage] ', '')
      };
    }
    if (part.startsWith('[missing-affinity]')) {
      return {
        type: 'missing-affinity',
        text: part.replace('[missing-affinity] ', '')
      };
    }
    if (part.startsWith('[dynamic]')) {
      const [text, tooltipText] = part
        .replace('[dynamic]', '')
        .split('|')
        .map(p => p.trim());
      return {
        type: 'dynamic',
        text,
        tooltipText
      };
    }
    for (const speed of Object.values(CARD_SPEED)) {
      if (part.startsWith(`[${speed}]`)) {
        return { type: speed };
      }
    }
    return { type: 'text', text: part };
  });
});

const showFullText = useIsKeyboardControlPressed({
  key: 'ShiftLeft',
  modifier: null
});
</script>

<template>
  <div class="card-text" :class="{ 'show-full-text': showFullText }">
    <span
      v-for="(token, index) in tokens"
      :key="index"
      :class="highlighted && `token-${token.type}`"
    >
      <UiSimpleTooltip v-if="token.type === 'exhaust'">
        <template #trigger>
          <img :src="assets['ui/ability-exhaust'].path" class="inline" />
        </template>
        Exhaust the card.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-if="token.type === 'dynamic'" :disabled="showFullText">
        <template #trigger>
          <span>{{ showFullText ? token.tooltipText : token.text }}</span>
        </template>
        {{ token.tooltipText }}
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === 'spellpower'">
        <template #trigger>
          <img :src="assets['ui/ability-power'].path" class="inline" />
        </template>
        <b>Spellpower</b>
        : is used to enhance the effects of some cards.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === 'health'">
        <template #trigger>
          <img :src="assets['ui/hp'].path" class="inline" />
        </template>
        <b>Health</b>
        : represents the amount of damage a minion or hero can take before being
        destroyed.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === 'attack'">
        <template #trigger>
          <img :src="assets['ui/attack'].path" class="inline" />
        </template>
        <b>Attack</b>
        : is the amount of damage a minion or hero can deal in combat.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === 'durability'">
        <template #trigger>
          <img
            :src="assets['ui/shield'].path"
            class="inline token-durability"
          />
        </template>
        <b>Durability</b>
        : when it reaches zero, the artifact is destroyed.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === CARD_SPEED.SLOW">
        <template #trigger>
          <span>SLOW</span>
        </template>
        This can only be activated at Slow speed.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === CARD_SPEED.FAST">
        <template #trigger>
          <span>FAST</span>
        </template>
        This can be activated at Fast speed.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === CARD_SPEED.BURST">
        <template #trigger>
          <span>BURST</span>
        </template>
        This can is activated at Burst speed and resolves instantly.
      </UiSimpleTooltip>

      <HoverCardRoot v-else :open-delay="250" :close-delay="0">
        <HoverCardTrigger>
          <span tabindex="0" v-if="'text' in token">
            {{ token.text }}
          </span>
        </HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent v-if="highlighted" class="z-10" side="right">
            <article>
              <div v-if="token.type === 'keyword'" class="keyword-card">
                <div class="font-600">{{ token.keyword.name }}</div>
                <p class="text-0">{{ token.keyword.description }}</p>
              </div>
              <BlueprintCard
                v-if="token.type === 'card'"
                :blueprint="token.card"
              />
            </article>
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
    </span>
  </div>
</template>

<style scoped lang="postcss">
.card-text {
  white-space: pre-wrap;
  color: var(--card-text-color, var(--card-text-color, black));
  line-height: 1.2;
}

.token-keyword {
  font-weight: var(--font-weight-7);
  text-decoration: underline;
}

.token-mana {
  background: url('@/assets/ui/mana-cost.png') no-repeat center center;
  background-size: cover;
  font-weight: var(--font-weight-5);
  border-radius: var(--radius-round);
  width: calc(20px * var(--pixel-scale) / 2);
  height: calc(18px * var(--pixel-scale) / 2);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 1px;
  color: white;
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;
}
.token-destiny {
  background: url('@/assets/ui/destiny-cost.png') no-repeat center center;
  background-size: cover;
  font-weight: var(--font-weight-5);
  border-radius: var(--radius-round);
  width: calc(20px * var(--pixel-scale) / 2);
  height: calc(18px * var(--pixel-scale) / 2);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 1px;
  color: white;
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;
}

.token-missing-affinity {
  color: var(--red-7);
  font-weight: var(--font-weight-7);
  font-size: 0.8em;
  > * {
    line-height: 1;
  }
}
.token-level-bonus,
.token-lineage-bonus {
  font-style: italic;
  text-decoration: underline;
}
.token-card {
  font-weight: var(--font-weight-7);
  text-decoration: underline;
}
/* eslint-disable-next-line vue-scoped-css/no-unused-selector */
.token-exhaust > img {
  transform: translateY(4px);
  width: calc(20px * var(--pixel-scale) / 2);
  height: calc(14px * var(--pixel-scale) / 2);
}
.token-dynamic-value {
  color: var(--blue-4);
  font-weight: var(--font-weight-5);
}
.token-spellpower {
  color: var(--blue-3);
  font-weight: var(--font-weight-5);
  img {
    width: 1.2em;
    aspect-ratio: 1;
    transform: translateY(4px);
    margin-inline: var(--size-1);
  }
}
.token-attack {
  color: var(--yellow-5);
  font-weight: var(--font-weight-5);
  img {
    width: 1.2em;
    aspect-ratio: 1;
    transform: translateY(3px);
  }
}
.token-SLOW,
.token-FAST,
.token-BURST {
  font-size: 0.8em;
  color: white;
  -webkit-text-stroke: calc(var(--pixel-scale) * 1 px) black;
  paint-order: stroke fill;
  padding-inline: calc(6px * var(--pixel-scale));
  clip-path: polygon(
    calc(3px * var(--pixel-scale)) 0,
    calc(100% - 3px * var(--pixel-scale)) 0,
    100% 50%,
    calc(100% - 3px * var(--pixel-scale)) 100%,
    calc(3px * var(--pixel-scale)) 100%,
    0 50%
  );
}

.token-SLOW {
  background: linear-gradient(to bottom, var(--red-8) 50%, var(--red-11) 50%);
}

.token-FAST {
  background: linear-gradient(to bottom, var(--cyan-8) 50%, var(--cyan-11) 50%);
}

.token-BURST {
  background: linear-gradient(to bottom, var(--gray-8) 50%, var(--gray-11) 50%);
}

.token-KNOWLEDGE,
.token-FOCUS,
.token-RESONANCE,
.token-MIGHT {
  img {
    width: calc(17px * var(--pixel-scale) / 2);
    height: calc(18px * var(--pixel-scale) / 2);
    aspect-ratio: 1;
    transform: translateY(6px);
  }
}
.token-health {
  color: var(--pink-6);
  font-weight: var(--font-weight-5);
  img {
    width: 1.2em;
    aspect-ratio: 1;
    transform: translateY(3px);
  }
}
.keyword-card {
  font-size: var(--font-size-0);
  width: var(--size-14);
  padding: var(--size-3);
  color: var(--text-1);
  background-color: black;
}
.card-text:not(.show-full-text) .token-dynamic {
  font-weight: var(--font-weight-7);
  color: var(--green-6);
  font-size: 1.25em;
  -webkit-text-stroke: calc(var(--pixel-scale) * 2px) black;
  paint-order: stroke fill;
  span {
    padding-inline: calc(var(--pixel-scale) * var(--size-05));
  }
}
</style>
