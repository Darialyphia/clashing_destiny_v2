<script setup lang="ts">
import { KEYWORDS } from '@game/engine/src/card/card-keywords';
import { isString } from '@game/shared';
import {
  HoverCardRoot,
  HoverCardContent,
  HoverCardTrigger,
  HoverCardPortal
} from 'reka-ui';
import type { ShallowRef } from 'vue';

const el = useTemplateRef('el') as Readonly<ShallowRef<HTMLSpanElement | null>>;

const keyword = computed(() => {
  const text = el.value?.textContent?.toLowerCase() || '';
  return Object.values(KEYWORDS).find(keyword => {
    return (
      text.match(new RegExp(`^${keyword.name.toLowerCase()}$`)) ||
      keyword.aliases.some(alias => {
        return isString(alias)
          ? text.match(alias.toLowerCase())
          : text.match(alias);
      })
    );
  });
});
</script>

<template>
  <HoverCardRoot :open-delay="250" :close-delay="0">
    <HoverCardTrigger>
      <span class="keyword" ref="el"><slot /></span>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent class="z-10" side="top">
        <article>
          <div class="keyword-card" v-if="keyword">
            <div class="font-600">{{ keyword.name }}</div>
            <p class="text-0">{{ keyword.description }}</p>
          </div>
        </article>
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
.keyword {
  font-weight: 700;
  font-style: italic;
}

.keyword-card {
  max-width: 30ch;
  padding: var(--size-3);
  color: var(--text-1);
  background-color: black;
  color: #efef9f;
  padding: var(--size-2) var(--size-3);
  font-family: var(--font-system-ui);
  font-size: 14px;
  border: solid 1px #bb8225;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
</style>
