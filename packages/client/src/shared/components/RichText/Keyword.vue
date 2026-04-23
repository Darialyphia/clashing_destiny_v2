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
      <span class="keyword" tabindex="0" ref="el"><slot /></span>
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
  text-decoration: underline;
  text-decoration-thickness: calc(1px * var(--pixel-scale));
  font-style: italic;
}

.keyword-card {
  font-size: var(--font-size-0);
  width: var(--size-14);
  padding: var(--size-3);
  color: var(--text-1);
  background-color: black;
}
</style>
