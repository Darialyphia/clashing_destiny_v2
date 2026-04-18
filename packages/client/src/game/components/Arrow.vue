<script setup lang="ts">
import { randomString } from '@game/shared';

const props = defineProps<{
  path: string;
  color: string;
}>();

const pathId = randomString(6);
// const markerId = randomString(6);
// const markerUrl = `url(#${markerId})`;
const shadowId = randomString(6);
const shadowUrl = `url(#${shadowId})`;

const circle = useTemplateRef('circle');
const pathEl = useTemplateRef<SVGPathElement>('pathEl');

const endPoint = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  props.path; // track path changes
  if (!pathEl.value) return { x: 0, y: 0 };
  const length = pathEl.value.getTotalLength();
  return pathEl.value.getPointAtLength(length);
});

let motionTween: gsap.core.Tween | null = null;

watch(
  [() => props.path, circle],
  ([path, circle]) => {
    if (!path) return;
    if (!circle) return;

    // Preserve progress when path changes
    const currentProgress = motionTween?.progress() ?? 0;

    if (motionTween) {
      motionTween.kill();
    }

    motionTween = gsap.to(circle, {
      duration: 3,
      motionPath: path,
      ease: Power1.easeInOut,
      repeat: -1
    });

    // Restore progress if we had a previous animation
    if (currentProgress > 0) {
      motionTween.progress(currentProgress);
    }
  },
  {
    immediate: true
  }
);
</script>

<template>
  <svg class="w-full h-full">
    <defs>
      <!-- <marker
        :id="markerId"
        markerWidth="13"
        markerHeight="13"
        :refX="2"
        :refY="6"
        orient="auto"
      >
        <path d="M 2 2 L 2 9 L 7 6 L 2 3" class="arrow-head" />
      </marker> -->
      <filter :id="shadowId" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0.2" dy="0.4" stdDeviation="0.2" />
      </filter>
    </defs>
    <g filter="url(#bloom-filter)">
      <path
        ref="pathEl"
        :id="pathId"
        class="path"
        :d="props.path"
        :filter="shadowUrl"
      />
      <path class="inner-path" :d="props.path" :filter="shadowUrl" />
      <circle cx="0" cy="0" r="5" class="circle" ref="circle" />
      <g :transform="`translate(${endPoint.x}, ${endPoint.y})`">
        <circle cx="0" cy="0" r="10" class="end-circle" />
        <circle cx="0" cy="-18" r="3" class="particle particle-1" />
        <circle cx="0" cy="-18" r="2.5" class="particle particle-2" />
        <circle cx="0" cy="-18" r="2" class="particle particle-3" />
        <circle cx="0" cy="-18" r="2" class="particle particle-4" />
      </g>
    </g>
  </svg>
</template>

<style scoped lang="postcss">
.path {
  stroke: v-bind(color);
  stroke-width: 5px;
  fill: none;
  /* marker-end: v-bind(markerUrl); */
  animation: arrow-dash 0.3s var(--ease-in-2) forwards;
  opacity: 0.75;
}
.inner-path {
  stroke: white;
  stroke-width: 2px;
  /* marker-end: v-bind(markerUrl); */
  fill: none;
  animation: arrow-dash 0.3s var(--ease-in-2) forwards;
  opacity: 0.75;
}
/*
.arrow-head {
  fill: v-bind(color);
  animation: arrow-head 0.2s var(--ease-in-2) forwards;
  animation-delay: 0.3s;
  opacity: 0;
} */

.circle {
  fill: white;
  stroke: v-bind(color);
  stroke-width: 3px;
}

.end-circle {
  fill: white;
  stroke: v-bind(color);
  stroke-width: 3px;
  animation: pulsate 1s ease-in-out infinite;
  animation-timing-function: linear;
  transform-origin: center;
}

.particle {
  fill: v-bind(color);
  opacity: 0.8;
  transform-origin: 0 0;
}

.particle-1 {
  animation: spin 1.5s linear infinite;
}

.particle-2 {
  animation: spin 1.5s linear infinite;
  animation-delay: -0.375s;
}

.particle-3 {
  animation: spin 1.5s linear infinite;
  animation-delay: -0.75s;
}

.particle-4 {
  animation: spin 1.5s linear infinite;
  animation-delay: -1.125s;
}

@keyframes pulsate {
  0%,
  100% {
    r: 10;
    opacity: 085;
  }
  50% {
    r: 14;
    opacity: 0.25;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes arrow-dash {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
