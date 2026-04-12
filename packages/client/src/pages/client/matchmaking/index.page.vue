<script setup lang="ts">
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import {
  useJoinMatchmaking,
  useLeaveMatchmaking
} from '@/matchmaking/composables';
import { useMatchmakingList } from './useMatchmakingList';
import { useMe } from '@/auth/composables/useMe';
import { useDecks, type UserDeck } from '@/card/composables/useDecks';
import PlayerDeck from '@/player/components/PlayerDeck.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import type { DeckId } from '@game/api';
import MatchmakingTimer from '@/matchmaking/components/MatchmakingTimer.vue';

definePage({
  name: 'Matchmaking'
});

const { data: me } = useMe();
const { data: decks, isLoading: isLoadingDecks } = useDecks();

const { data: matchmakings, isLoading } = useMatchmakingList();
const { mutate: join, isLoading: isJoining } = useJoinMatchmaking();
const { mutate: leave, isLoading: isLeaving } = useLeaveMatchmaking();

const selectedDeckId = ref<string | null>(null);
const selectedQueueName = ref<string | null>(null);

const isInMatchmaking = computed(() => {
  return !!me.value?.currentJoinedMatchmaking;
});

const canJoin = computed(() => {
  return (
    selectedDeckId.value && selectedQueueName.value && !isInMatchmaking.value
  );
});

const getDisplayedDeck = (deck: UserDeck) => ({
  name: deck.name,
  cards: deck.cards.map(card => ({
    blueprintId: card.blueprintId,
    copies: card.copies
  }))
});
</script>

<template>
  <div class="matchmaking-page">
    <AuthenticatedHeader />
    <main class="container">
      <h1 class="page-title">Matchmaking</h1>

      <div class="matchmaking-content">
        <section class="surface">
          <h2>1. Select Your Deck</h2>

          <div v-if="isLoadingDecks" class="loading-state">
            Loading decks...
          </div>

          <div v-else-if="!decks?.length" class="empty-state">
            No decks available. Create a deck first!
          </div>

          <ul v-else class="grid gap-3 mb-4">
            <li
              v-for="deck in decks"
              :key="deck.id"
              class="deck-option"
              :class="{ selected: selectedDeckId === deck.id }"
              @click="selectedDeckId = deck.id"
            >
              <PlayerDeck :deck="getDisplayedDeck(deck)" />
              <div v-if="selectedDeckId === deck.id" class="selected-indicator">
                ✓
              </div>
            </li>
          </ul>
        </section>

        <section class="surface">
          <h2>2. Select Queue</h2>

          <div v-if="isLoading" class="loading-state">
            Loading matchmakings...
          </div>

          <div v-else-if="!matchmakings?.length" class="empty-state">
            No matchmakings available.
          </div>

          <ul v-else class="matchmaking-list">
            <li
              v-for="matchmaking in matchmakings"
              :key="matchmaking.id"
              class="matchmaking-card"
              :class="{
                selected: selectedQueueName === matchmaking.name,
                disabled: !matchmaking.enabled
              }"
              @click="
                () => {
                  if (!matchmaking.enabled) return;
                  selectedQueueName = matchmaking.name;
                }
              "
            >
              <header>
                <h3>{{ matchmaking.name }}</h3>
                <span v-if="!matchmaking.enabled" class="disabled-badge">
                  Disabled
                </span>
              </header>
              <p class="matchmaking-description">
                {{ matchmaking.description }}
              </p>
              <div
                v-if="selectedQueueName === matchmaking.name"
                class="selected-indicator"
              >
                ✓
              </div>
            </li>
          </ul>
        </section>

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
.container {
  max-width: var(--size-lg);
  margin: 0 auto;
  padding: var(--size-6);
}

.page-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: var(--font-size-6);
  font-weight: var(--font-weight-7);
  color: transparent;
  background-image: linear-gradient(45deg, #efef9f, #d7ad42);
  background-clip: text;
  text-align: center;
  margin-bottom: var(--size-8);
}

.matchmaking-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: var(--size-6);
  align-items: start;
}

footer {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-4);
  background: var(--surface-1);
}

h2 {
  font-family: 'Cinzel Decorative', serif;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);
  color: #efef9f;
  margin-bottom: var(--size-4);
  text-align: center;
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
    background: rgba(239, 239, 159, 0.1);
  }
}

.selected-indicator {
  position: absolute;
  top: var(--size-2);
  right: var(--size-2);
  background: linear-gradient(45deg, #d7ad42, #efef9f);
  color: hsl(240 100% 5%);
  border-radius: 50%;
  width: var(--size-6);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-7);
  font-size: var(--font-size-2);
  box-shadow: 0 2px 8px rgba(215, 173, 66, 0.5);
}

.matchmaking-card .loading-state,
.empty-state {
  text-align: center;
  padding: var(--size-8);
  color: #a8a8a8;
  font-size: 1.1rem;
}

.matchmaking-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  padding: var(--size-2) var(--size-4);

  &:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px hsl(240 100% 5% / 0.3);
    border-color: #efef9f;
  }

  &.selected {
    border-color: #d7ad42;
    background: rgba(239, 239, 159, 0.1);
  }

  .selected-indicator {
    position: absolute;
    top: var(--size-2);
    right: var(--size-2);
  }

  > header {
    margin-bottom: var(--size-2);

    > h3 {
      font-size: var(--font-size-4);
      font-weight: var(--font-weight-6);
      color: #efef9f;
      display: inline;
      margin-right: var(--size-4);
    }
  }
}

.disabled-badge {
  color: var(--red-5);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  border-radius: var(--radius-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.matchmaking-description {
  color: #a8a8a8;
  margin: 0;
}

@media (max-width: 768px) {
  .matchmaking-content {
    grid-template-columns: 1fr;
    gap: var(--size-4);
  }

  .matchmaking-card {
    flex-direction: column;
    gap: var(--size-4);
    text-align: center;
  }
}
</style>
