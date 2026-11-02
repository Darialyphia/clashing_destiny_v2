<script setup lang="ts">
import Sound from '@/shared/components/Sound.vue';
</script>

<template>
  <Sound sound="play-card-2" :triggers="['mousedown']" :sound-delay="270">
    <Sound sound="select" :triggers="['mouseup']">
      <Sound
        sound="card-hover"
        :triggers="['mouseenter']"
        :volume="0.4"
        :hoverDelay="150"
      >
        <slot />
      </Sound>
    </Sound>
  </Sound>
</template>
