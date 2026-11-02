<script setup lang="ts">
import { type Nullable, isFunction, isString } from '@game/shared';
import { Slot as RadixSlot } from 'reka-ui';
import { nanoid } from 'nanoid';
import {
  useSoundEffect,
  type SoundEffectOptions
} from '../composables/useSoundEffect';
import { useEventListener } from '@vueuse/core';

const {
  sound,
  triggers,
  enabled = true,
  fadeIn,
  loop,
  rateVariance,
  throttle,
  volume,
  hoverDelay = 0,
  soundDelay = 0
} = defineProps<
  {
    sound: string;
    soundDelay?: number;
    hoverDelay?: number;
    triggers: Array<
      'mouseenter' | 'mouseleave' | 'mousedown' | 'mouseup' | (() => boolean)
    >;
    enabled?: boolean;
  } & SoundEffectOptions
>();

const id = `_${nanoid(6).replaceAll('-', '_')}`;
const el = ref<Nullable<HTMLElement>>(null);

const howl = useSoundEffect(sound, {
  fadeIn,
  loop,
  rateVariance,
  throttle,
  volume
});

onMounted(async () => {
  if (enabled) {
    el.value = document.querySelector(
      `[data-sound-${triggers.join('-')}=${id}]`
    ) as HTMLElement | null;
  }
});

const isHovered = ref(false);
useEventListener(el, 'mouseenter', () => {
  isHovered.value = true;
});
useEventListener(el, 'mouseleave', () => {
  isHovered.value = false;
});

const eventNames = triggers.filter(t => isString(t));

const playSound = () => {
  setTimeout(() => {
    howl.value?.play();
  }, soundDelay);
};
useEventListener(el, eventNames as string[], e => {
  if (e.type === 'mouseenter') {
    if (hoverDelay > 0) {
      setTimeout(() => {
        if (isHovered.value) {
          playSound();
        }
      }, hoverDelay);
      return;
    }
  }
  playSound();
});

watchEffect(() => {
  triggers.forEach(t => {
    if (isFunction(t) && t()) {
      howl.value?.play();
    }
  });
});

const bind = computed(() => ({ [`data-sound-${triggers.join('-')}`]: id }));
</script>

<template>
  <RadixSlot v-bind="bind">
    <slot />
  </RadixSlot>
</template>
