<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useAutoResizeText } from '@/card/composables/useAutoResizeText';
import { nanoid } from 'nanoid';

defineProps<{
  name: string;
}>();

const nameBox = useTemplateRef('name-box');
const { fontSize: nameFontSize } = useAutoResizeText(nameBox, {
  min: 14,
  max: 24,
  ideal: 24
});

const curveId = `card-name-curve-${nanoid(4)}`;
</script>

<template>
  <div ref="name-box" class="name parallax">
    <svg viewBox="0 0 400 80" class="w-full">
      <defs>
        <radialGradient id="name-gradient">
          <stop offset="15%" stop-color="#e9d8c0" />
          <stop offset="80%" stop-color="#cbb599" />
        </radialGradient>

        <path
          :id="curveId"
          ref="pathElement"
          pathLength="100"
          d="M 25 58 Q 200 16 375 58"
        />
      </defs>

      <text>
        <textPath
          class="name-text"
          :href="`#${curveId}`"
          text-anchor="middle"
          startOffset="50%"
          stroke="black"
          paint-order="stroke"
          fill="url(#name-gradient)"
        >
          {{ name }}
        </textPath>
      </text>
    </svg>
  </div>
</template>

<style scoped lang="postcss">
.name {
  position: absolute;
  top: calc(163px * var(--pixel-scale));
  left: 0;
  width: 100%;
  text-align: center;
  font-weight: bold;

  svg text {
    font-family: 'Lato';
    font-size: calc(1px * v-bind(nameFontSize));
    fill: #dbc4a4;
    filter: drop-shadow(0 calc(2.5px * var(--pixel-scale)) 0 black);
  }
}
</style>
