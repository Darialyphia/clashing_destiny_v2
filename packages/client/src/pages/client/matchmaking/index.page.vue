<script setup lang="ts">
import {
  useJoinMatchmaking,
  useLeaveMatchmaking
} from '@/matchmaking/composables';
import { useMatchmakingList } from './useMatchmakingList';
import { useMe } from '@/auth/composables/useMe';
import { useDecks, type UserDeck } from '@/card/composables/useDecks';
import FancyButton from '@/ui/components/FancyButton.vue';
import type { DeckId } from '@game/api';
import MatchmakingTimer from '@/matchmaking/components/MatchmakingTimer.vue';
import PlayerDeckCard from '@/player/components/PlayerDeckCard.vue';
import PageTitle from '@/shared/components/PageTitle.vue';
import BackButton from '@/shared/components/BackButton.vue';
import CardQuiz from '@/matchmaking/components/CardQuiz.vue';

definePage({
  name: 'Matchmaking',
  meta: {
    wrapperClass: 'page-blur'
  }
});

const { data: me } = useMe();
const { data: decks, isLoading: isLoadingDecks } = useDecks();

const { data: matchmakings } = useMatchmakingList();
const { mutate: join, isLoading: isJoining } = useJoinMatchmaking();
const { mutate: leave, isLoading: isLeaving } = useLeaveMatchmaking();

const selectedDeckId = ref<string | null>(null);
const selectedQueueName = ref<string | null>(null);
watch(
  matchmakings,
  newMatchmakings => {
    if (newMatchmakings?.length) {
      selectedQueueName.value = newMatchmakings[0]?.name;
    }
  },
  { immediate: true }
);
watch(
  decks,
  newDecks => {
    if (newDecks?.length) {
      selectedDeckId.value = newDecks[0]?.id;
    }
  },
  { immediate: true }
);

const isInMatchmaking = computed(() => {
  return !!me.value?.currentJoinedMatchmaking;
});

const canJoin = computed(() => {
  return (
    selectedDeckId.value && selectedQueueName.value && !isInMatchmaking.value
  );
});

const getDisplayedDeck = (deck: UserDeck) => ({
  id: deck.id,
  name: deck.name,
  factionId: deck.factionId,
  cards: deck.cards,
  isValid: deck.isValid
});
</script>

<template>
  <div class="page">
    <BackButton class="absolute top-10 left-8" :to="{ name: 'SelectMode' }" />

    <main class="container">
      <div>
        <PageTitle title="Matchmaking" />
      </div>

      <div class="matchmaking-content">
        <Transition mode="out-in">
          <section v-if="isInMatchmaking" class="surface quiz-section">
            <CardQuiz />
          </section>
          <section v-else style="height: 100%; overflow: hidden">
            <div v-if="isLoadingDecks" class="loading-state">
              Loading decks...
            </div>

            <div v-else-if="!decks?.length" class="surface empty-state">
              No decks available. Create a deck first!
            </div>

            <ul v-else class="decks-list fancy-scrollbar">
              <li
                v-for="deck in decks"
                :key="deck.id"
                class="deck-option"
                :class="{ selected: selectedDeckId === deck.id }"
                @click="
                  () => {
                    if (deck.isValid.result === 'failure') return;
                    selectedDeckId = deck.id;
                  }
                "
              >
                <PlayerDeckCard :deck="getDisplayedDeck(deck)" />
              </li>
            </ul>
          </section>
        </Transition>

        <footer>
          <FancyButton
            v-if="!isInMatchmaking"
            :disabled="!canJoin || isJoining"
            :text="isJoining ? 'Joining...' : 'Join Queue'"
            size="lg"
            @click="
              join({
                name: selectedQueueName!,
                deckId: selectedDeckId as DeckId
              })
            "
          />

          <template v-else>
            <FancyButton
              :disabled="isLeaving"
              :text="isLeaving ? 'Leaving...' : 'Leave Queue'"
              size="lg"
              @click="leave({})"
            />
            <MatchmakingTimer
              :joined-at="me.currentJoinedMatchmaking!.joinedAt"
            />
          </template>
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss">
.page {
  min-height: 100vh;
  background: url('@/assets/backgrounds/main-menu-overlay.png');
  background-size: 100% 100%;
  display: grid;
  align-items: center;
}

.container {
  max-width: var(--size-lg);
  margin: 0 auto;
  container-type: inline-size;
  display: grid;
  grid-template-rows: auto 1fr;
  height: 90dvh;
  justify-content: center;
  align-items: center;
}

.matchmaking-content {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  gap: var(--size-6);
  align-items: start;
  height: 100%;
  overflow: hidden;
}

footer {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-4);
}

@property --selected-deck-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes selected-deck-rotate {
  from {
    --selected-deck-angle: 0deg;
  }
  to {
    --selected-deck-angle: 360deg;
  }
}

.decks-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--size-3);
  margin-bottom: var(--size-4);
  max-height: 100%;
  overflow-y: auto;
}

.deck-option {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-inline: var(--size-3);

  &:hover {
    transform: translateY(-2px);
  }
  &.selected {
    filter: brightness(1.5);
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: conic-gradient(
        from var(--selected-deck-angle) at center,
        var(--yellow-2),
        transparent,
        var(--orange-7),
        transparent,
        var(--yellow-10),
        transparent,
        cyan
      );
      animation: selected-deck-rotate 3.5s linear infinite;
      mask-image: url(@/assets/ui/card/v3/deck.png);
      mask-size: cover;
      transform-origin: center;
      scale: 1.05;
      z-index: -1;
    }
  }
}

.quiz-section {
  width: min(52rem, 100cqi);
  align-self: center;
}

.matchmaking-card .loading-state,
.empty-state {
  text-align: center;
  padding: var(--size-8);
  color: #a8a8a8;
  font-size: var(--font-size-2);
}

.v-enter-active,
.v-leave-active {
  transition: all 0.3s var(--ease-3);
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  translate: 0 -10px;
  scale: 0.5;
}
</style>
