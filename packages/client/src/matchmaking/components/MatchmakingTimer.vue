<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

export interface MatchmakingTimerProps {
  joinedAt: number;
}

const { joinedAt } = defineProps<MatchmakingTimerProps>();

// Timer functionality
const currentTime = ref(Date.now());

useIntervalFn(() => {
  currentTime.value = Date.now();
}, 1000);

// Reset timer when joinedAt changes (new matchmaking session)
watch(
  () => joinedAt,
  () => {
    currentTime.value = Date.now();
  }
);

// Calculate elapsed time in matchmaking
const matchmakingElapsed = computed(() => {
  if (!joinedAt) return '00:00';

  const elapsed = currentTime.value - joinedAt;
  if (elapsed < 0) return '00:00'; // Safety check for negative durations
  return formatDuration(elapsed);
});

// Format duration in mm:ss format
function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
</script>

<template>
  <div class="matchmaking-timer">
    <span class="timer-value">{{ matchmakingElapsed }}</span>
  </div>
</template>

<style scoped lang="postcss">
.matchmaking-timer {
  display: flex;
  align-items: center;
  gap: var(--size-1);
  margin-left: var(--size-1);
}

.timer-value {
  color: #efef9f;
  font-weight: var(--font-weight-6);
  font-family: 'Courier New', monospace;
  padding: var(--size-1) var(--size-2);
  text-align: center;
}
</style>
