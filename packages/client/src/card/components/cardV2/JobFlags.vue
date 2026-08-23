<script setup lang="ts">
import type { JobId } from '@game/engine/src/card/card.enums';

const { jobs } = defineProps<{
  jobs: JobId[];
}>();
</script>

<template>
  <div class="job-flags" v-if="jobs.length > 0">
    <div
      v-for="(job, index) in jobs"
      :key="index"
      class="job-flag"
      :data-job="job.toLocaleLowerCase()"
    />
  </div>
</template>

<style scoped lang="postcss">
.job-flags {
  display: flex;
  flex-direction: column;
  gap: calc(2px * var(--pixel-scale));

  .job-flag {
    width: calc(30px * var(--pixel-scale));
    height: calc(34px * var(--pixel-scale));
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    translate: 0 calc((-1 + var(--child-index)) * -10px * var(--pixel-scale));
    position: relative;
    z-index: calc(10 - var(--child-index));
    &[data-job='warrior'] {
      background-image: url('@/assets/ui/card/v2/job-flag-warrior.png');
    }
    &[data-job='mage'] {
      background-image: url('@/assets/ui/card/v2/job-flag-mage.png');
    }
    &[data-job='rogue'] {
      background-image: url('@/assets/ui/card/v2/job-flag-rogue.png');
    }
    &[data-job='acolyte'] {
      background-image: url('@/assets/ui/card/v2/job-flag-acolyte.png');
    }
    &[data-job='ranger'] {
      background-image: url('@/assets/ui/card/v2/job-flag-ranger.png');
    }
  }
}
</style>
