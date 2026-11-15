<script setup lang="ts">
import { useEventListener, useLocalStorage, useTimeoutFn } from '@vueuse/core';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import CardSpriteThumb from './CardSpriteThumb.vue';
import {
  createCardQuiz,
  type QuizChoice,
  type QuizQuestion
} from '../card-quiz';

const NEXT_DELAY_CORRECT = 1200;
const NEXT_DELAY_WRONG = 2600;

const quiz = createCardQuiz();
const question = ref<QuizQuestion>(quiz.nextQuestion());
const selectedId = ref<string | null>(null);

const streak = ref(0);
const bestStreak = useLocalStorage('card-quiz-best-streak', 0);
const correctCount = ref(0);
const answeredCount = ref(0);

const isAnswered = computed(() => selectedId.value !== null);
const isCorrect = computed(() => selectedId.value === question.value.answerId);
const isArtQuestion = computed(() => question.value.field === 'art');

const masked = computed(() => {
  const { field } = question.value;
  if (isAnswered.value || field === 'art') return {};
  return { [field]: field === 'name' ? '???' : '?' };
});

const next = () => {
  stopNextTimer();
  selectedId.value = null;
  question.value = quiz.nextQuestion();
};

const { start: startNextTimer, stop: stopNextTimer } = useTimeoutFn(
  next,
  () => (isCorrect.value ? NEXT_DELAY_CORRECT : NEXT_DELAY_WRONG),
  { immediate: false }
);

const answer = (choice: QuizChoice) => {
  if (isAnswered.value) return;
  selectedId.value = choice.id;
  answeredCount.value++;
  if (isCorrect.value) {
    correctCount.value++;
    streak.value++;
    bestStreak.value = Math.max(bestStreak.value, streak.value);
  } else {
    streak.value = 0;
  }
  startNextTimer();
};

const getChoiceState = (choice: QuizChoice) => {
  if (!isAnswered.value) return null;
  if (choice.id === question.value.answerId) return 'correct';
  if (choice.id === selectedId.value) return 'wrong';
  return 'dimmed';
};

// 1 / 2 / 3 to answer, Enter or Space to skip to the next card
useEventListener('keydown', (e: KeyboardEvent) => {
  const target = e.target as HTMLElement | null;
  if (target?.closest('input, textarea, [contenteditable]')) return;

  if (isAnswered.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      next();
    }
    return;
  }
  const choice = question.value.choices[Number(e.key) - 1];
  if (choice) answer(choice);
});
</script>

<template>
  <section class="card-quiz">
    <header class="quiz-header">
      <h2>While you wait…</h2>
      <p class="scores">
        <span>
          Streak
          <b>{{ streak }}</b>
        </span>
        <span>
          Best
          <b>{{ bestStreak }}</b>
        </span>
        <span v-if="answeredCount">
          Score
          <b>{{ correctCount }}/{{ answeredCount }}</b>
        </span>
      </p>
    </header>

    <div class="quiz-body">
      <Transition name="quiz-card" mode="out-in">
        <div
          :key="question.id"
          class="quiz-card"
          :class="{ 'is-answered': isAnswered }"
          @click="isAnswered && next()"
        >
          <BlueprintCard
            :blueprint="question.blueprint"
            :masked="masked"
            :is-art-hidden="isArtQuestion && !isAnswered"
            :is-tilt-enabled="false"
          />
          <div v-if="isArtQuestion && !isAnswered" class="hidden-art">?</div>
        </div>
      </Transition>

      <div class="quiz-panel">
        <Transition name="quiz-prompt" mode="out-in">
          <div :key="question.id" class="quiz-prompt-wrapper">
            <p class="prompt">{{ question.prompt }}</p>

            <ul class="choices" :class="{ 'is-art': isArtQuestion }">
              <li v-for="choice in question.choices" :key="choice.id">
                <button
                  class="choice"
                  :class="getChoiceState(choice)"
                  :disabled="isAnswered"
                  @click="answer(choice)"
                >
                  <CardSpriteThumb
                    v-if="choice.blueprint"
                    :blueprint="choice.blueprint"
                    :size="120"
                  />
                  <span v-else class="label">{{ choice.label }}</span>
                </button>
              </li>
            </ul>
          </div>
        </Transition>

        <div class="feedback" aria-live="polite">
          <template v-if="isAnswered">
            <span :class="isCorrect ? 'is-correct' : 'is-wrong'">
              {{ isCorrect ? 'Correct!' : 'Not quite…' }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="postcss">
.card-quiz {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  width: 100%;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--size-4);
  flex-wrap: wrap;

  h2 {
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-7);
    color: #f8eabb;
  }
}

.scores {
  display: flex;
  gap: var(--size-4);
  color: #ddd5e8;
  b {
    color: #f8eabb;
    font-variant-numeric: tabular-nums;
  }
}

.quiz-body {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--size-7);
  align-items: center;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}

.quiz-card {
  position: relative;
  &.is-answered {
    cursor: pointer;
  }
}

/* sits over the card's art area */
.hidden-art {
  position: absolute;
  left: calc(24px * var(--pixel-scale));
  right: calc(24px * var(--pixel-scale));
  top: calc(12px * var(--pixel-scale));
  height: calc(72px * var(--pixel-scale));
  display: grid;
  place-items: center;
  font-size: calc(40px * var(--pixel-scale));
  font-weight: var(--font-weight-9);
  color: #f8eabb;
  text-shadow:
    0 0 12px hsl(45 100% 60% / 0.7),
    0 2px 0 black;
  pointer-events: none;
  animation: hidden-art-pulse 2s ease-in-out infinite;
}

@keyframes hidden-art-pulse {
  50% {
    opacity: 0.6;
    scale: 0.95;
  }
}

.quiz-panel {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  min-width: 0;
}

.prompt {
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-4);
  color: #fcfcfc;
}

.choices {
  display: grid;
  gap: var(--size-3);

  &.is-art {
    grid-template-columns: repeat(3, auto);
    justify-content: start;
  }
}

.choice {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--size-9);
  padding: var(--size-2) var(--size-7);
  background: hsl(250 30% 8% / 0.75);
  border: 2px solid #5e4a2a;
  border-radius: var(--radius-2);
  color: #fcfcfc;
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  transition:
    border-color 0.15s,
    background-color 0.15s,
    opacity 0.3s,
    transform 0.15s;

  .is-art & {
    padding: var(--size-2);
  }

  &:not(:disabled):hover {
    border-color: #c79a3b;
    background: hsl(250 30% 14% / 0.85);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid #f8eabb;
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
  }

  &.correct {
    border-color: var(--green-5);
    background: hsl(140 50% 18% / 0.85);
    box-shadow: 0 0 16px hsl(140 70% 45% / 0.5);
  }
  &.wrong {
    border-color: var(--red-6);
    background: hsl(0 50% 18% / 0.85);
    animation: choice-shake 0.35s;
  }
  &.dimmed {
    opacity: 0.4;
  }
}

@keyframes choice-shake {
  25% {
    translate: -4px 0;
  }
  75% {
    translate: 4px 0;
  }
}

.hotkey {
  position: absolute;
  top: var(--size-1);
  left: var(--size-2);
  font-size: var(--font-size-0);
  color: #a8a8a8;
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feedback {
  min-height: var(--size-8);
  display: flex;
  align-items: center;
  gap: var(--size-4);
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-7);

  .is-correct {
    color: var(--green-4);
  }
  .is-wrong {
    color: var(--red-4);
  }
}

.next {
  color: #ddd5e8;
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-5);
  text-decoration: underline;
  text-underline-offset: 3px;
  &:hover {
    color: #f8eabb;
  }
}

.quiz-card-enter-active,
.quiz-card-leave-active,
.quiz-prompt-enter-active,
.quiz-prompt-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s var(--ease-out-3);
}
.quiz-card-enter-from {
  opacity: 0;
  transform: translateX(24px) rotate(3deg);
}
.quiz-card-leave-to {
  opacity: 0;
  transform: translateX(-24px) rotate(-3deg);
}
.quiz-prompt-enter-from,
.quiz-prompt-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .quiz-card-enter-from,
  .quiz-card-leave-to {
    transform: none;
  }
  .hidden-art,
  .choice.wrong {
    animation: none;
  }
}
</style>
