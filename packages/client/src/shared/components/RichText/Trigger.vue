<script setup lang="ts">
import { KEYWORDS } from '@game/engine/src/card/card-keywords';
import { isString } from '@game/shared';
import type { ShallowRef } from 'vue';
import {
  HoverCardRoot,
  HoverCardContent,
  HoverCardTrigger,
  HoverCardPortal
} from 'reka-ui';

const { color = 'red' } = defineProps<{
  color?: 'red' | 'blue' | 'green' | 'yellow';
}>();

const el = useTemplateRef('el') as Readonly<ShallowRef<HTMLSpanElement | null>>;

const keyword = computed(() => {
  const text = el.value?.textContent?.toLowerCase() || '';
  const k = Object.values(KEYWORDS).find(keyword => {
    return (
      text.match(new RegExp(`^${keyword.name.toLowerCase()}$`)) ||
      keyword.aliases.some(alias => {
        return isString(alias)
          ? text.match(alias.toLowerCase())
          : text.match(alias);
      })
    );
  });
  return k;
});
</script>

<template>
  <HoverCardRoot :open-delay="250" :close-delay="0">
    <HoverCardTrigger>
      <span ref="el" class="trigger" :class="color">
        <span>
          <slot />
        </span>
      </span>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent v-if="keyword" class="z-10" side="top">
        <article>
          <div class="keyword-card">
            <div class="font-600">{{ keyword.name }}</div>
            <p class="text-0">{{ keyword.description }}</p>
          </div>
        </article>
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
.trigger {
  background: linear-gradient(
    to bottom,
    var(--top-color) 50%,
    var(--bottom-color) 50%
  );
  color: #f8eabb;
  padding-inline: calc(6px * var(--pixel-scale));
  padding-block: calc(0.5px * var(--pixel-scale)) calc(1px * var(--pixel-scale));
  font-size: 0.9em;
  clip-path: polygon(
    calc(3px * var(--pixel-scale)) 0%,
    100% 0%,
    calc(100% - 2px * var(--pixel-scale)) 100%,
    0% 100%
  );
  font-weight: 500;
  font-family: var(--font-system-ui);
  -webkit-text-stroke: calc(1.5px * var(--pixel-scale)) black;
  paint-order: stroke fill;
  span {
    display: inline-block;
    transform: skewX(-5deg);
  }
}

.red {
  --top-color: hsl(var(--red-9-hsl) / 0.6);
  --bottom-color: hsl(var(--red-12-hsl) / 0.6);
}

.blue {
  --top-color: hsl(var(--blue-9-hsl) / 0.6);
  --bottom-color: hsl(var(--blue-12-hsl) / 0.6);
}

.green {
  --top-color: hsl(var(--green-9-hsl) / 0.6);
  --bottom-color: hsl(var(--green-12-hsl) / 0.6);
}

.yellow {
  --top-color: hsl(var(--yellow-7-hsl) / 0.6);
  --bottom-color: hsl(var(--yellow-10-hsl) / 0.6);
  color: black;
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
