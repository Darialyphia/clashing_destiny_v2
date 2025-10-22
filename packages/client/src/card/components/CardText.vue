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
  | { type: CardSpeed };
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
    const card = Object.values(CARDS_DICTIONARY).find(c => c.name === part);
    if (card)
      return {
        type: 'card',
        text: part,
        card: card
      };
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
    if (part.startsWith('[health]')) {
      return { type: 'health' };
    }
    if (part.startsWith('[attack]')) {
      return { type: 'attack' };
    }
    if (part.startsWith('[durability]')) {
      return { type: 'durability' };
    }
    if (part.startsWith('[level]')) {
      return {
        type: 'level-bonus',
        text: part.replace('[level] ', 'Level ')
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
    for (const speed of Object.values(CARD_SPEED)) {
      if (part.startsWith(`[${speed}]`)) {
        return { type: speed };
      }
    }
    return { type: 'text', text: part };
  });
});
</script>

<template>
  <div class="card-text">
    <span
      v-for="(token, index) in tokens"
      :key="index"
      :class="highlighted && `token-${token.type}`"
    >
      <UiSimpleTooltip v-if="token.type === 'exhaust'">
        <template #trigger>
          <img src="/assets/ui/ability-exhaust.png" class="inline" />
        </template>
        Exhaust the card.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === 'spellpower'">
        <template #trigger>
          <img src="/assets/ui/ability-power.png" class="inline" />
        </template>
        <b>Spellpower</b>
        : is used to enhance the effects of some cards.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === 'health'">
        <template #trigger>
          <img src="/assets/ui/hp.png" class="inline" />
        </template>
        <b>Health</b>
        : represents the amount of damage a minion or hero can take before being
        destroyed.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === 'attack'">
        <template #trigger>
          <img src="/assets/ui/attack.png" class="inline" />
        </template>
        <b>Attack</b>
        : is the amount of damage a minion or hero can deal in combat.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === 'durability'">
        <template #trigger>
          <img src="/assets/ui/shield.png" class="inline" />
        </template>
        <b>Durability</b>
        : when it reaches zero, the artifact is destroyed.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === CARD_SPEED.SLOW">
        <template #trigger>
          <img src="/assets/ui/speed-slow.png" class="inline" />
        </template>

        This can only be activated at Slow speed.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === CARD_SPEED.FAST">
        <template #trigger>
          <img src="/assets/ui/speed-fast.png" class="inline" />
        </template>

        This can be activated at Fast speed.
      </UiSimpleTooltip>

      <UiSimpleTooltip v-else-if="token.type === CARD_SPEED.FLASH">
        <template #trigger>
          <img src="/assets/ui/speed-flash.png" class="inline" />
        </template>

        This can is activated at Flash speed and resolves instantly.
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
  color: #d7ad42;
  color: #efef9f;
  line-height: 1.3;
}

:is(.token-keyword, .token-card) {
  font-weight: var(--font-weight-7);
  color: #efef9f;
  color: #d7ad42;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

.token-mana {
  background: url('/assets/ui/mana-cost.png') no-repeat center center;
  background-size: cover;
  font-weight: var(--font-weight-5);
  border-radius: var(--radius-round);
  width: 22px;
  height: 20px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 1px;
  text-shadow: 0 2px 2px black;
}
.token-destiny {
  background: url('/assets/ui/destiny-cost.png') no-repeat center center;
  background-size: cover;
  font-weight: var(--font-weight-5);
  border-radius: var(--radius-round);
  width: var(--size-5);
  height: var(--size-5);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 1px;
  text-shadow: 0 2px 2px black;
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
  font-weight: var(--font-weight-7);
  text-decoration: underline;
}
.token-card {
  color: var(--lime-4);
}
/* eslint-disable-next-line vue-scoped-css/no-unused-selector */
.token-exhaust > img {
  transform: translateY(4px);
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
    margin-inline: var(--size-1);
  }
}
.token-SLOW,
.token-FAST,
.token-FLASH {
  img {
    width: 22px;
    height: 20px;
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
    margin-inline: var(--size-1);
  }
}
.keyword-card {
  font-size: var(--font-size-0);
  width: var(--size-14);
  padding: var(--size-3);
  color: var(--text-1);
  background-color: black;
}
</style>
