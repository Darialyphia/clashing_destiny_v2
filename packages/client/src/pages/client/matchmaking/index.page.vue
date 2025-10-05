<script setup lang="ts">
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import {
  useJoinMatchmaking,
  useLeaveMatchmaking
} from '@/matchmaking/composables';
import { useMatchmakingList } from './useMatchmakingList';
import { useMe } from '@/auth/composables/useMe';
import { useDecks } from '@/card/composables/useDecks';
import PlayerDeck from '@/player/components/PlayerDeck.vue';
import FancyButton from '@/ui/components/FancyButton.vue';

definePage({
  name: 'Matchmaking'
});

const { data: me } = useMe();
const { data: decks, isLoading: isLoadingDecks } = useDecks();

const { data, isLoading } = useMatchmakingList();
const { mutate: join, isLoading: isJoining } = useJoinMatchmaking();
const { mutate: leave, isLoading: isLeaving } = useLeaveMatchmaking();

// Selected deck state
const selectedDeckId = ref<string | null>(null);

// Helper function to check if user is in a specific matchmaking
const isInMatchmaking = (matchmakingName: string) => {
  return me.value?.currentJoinedMatchmaking?.name === matchmakingName;
};

const handleDeckSelect = (deckId: string) => {
  selectedDeckId.value = deckId;
};

const handleJoin = (matchmakingName: string) => {
  if (!selectedDeckId.value) {
    return; // Should not happen due to disabled state, but safety check
  }

  join({
    name: matchmakingName,
    deckId: selectedDeckId.value as any
  });
};

const handleLeave = () => {
  leave({});
};

// Convert UserDeck to DisplayedDeck format for PlayerDeck component
const getDisplayedDeck = (deck: any) => ({
  name: deck.name,
  mainDeck: deck.mainDeck.map((card: any) => ({
    blueprintId: card.blueprintId
  })),
  destinyDeck: deck.destinyDeck.map((card: any) => ({
    blueprintId: card.blueprintId
  }))
});
</script>

<template>
  <div class="matchmaking-page">
    <AuthenticatedHeader />
    <main class="container">
      <h1 class="page-title">Matchmaking</h1>

      <div class="matchmaking-content">
        <!-- Deck Selection Section -->
        <section class="deck-selection">
          <h2 class="section-title">Select Your Deck</h2>

          <div v-if="isLoadingDecks" class="loading-state">
            Loading decks...
          </div>

          <div v-else-if="!decks?.length" class="empty-state">
            No decks available. Create a deck first!
          </div>

          <div v-else class="deck-list">
            <div
              v-for="deck in decks"
              :key="deck.id"
              class="deck-option"
              :class="{ selected: selectedDeckId === deck.id }"
              @click="handleDeckSelect(deck.id)"
            >
              <PlayerDeck :deck="getDisplayedDeck(deck)" />
              <div v-if="selectedDeckId === deck.id" class="selected-indicator">
                ✓
              </div>
            </div>
          </div>
        </section>

        <!-- Matchmaking List Section -->
        <section class="matchmaking-section">
          <h2 class="section-title">Available queues</h2>

          <div v-if="isLoading" class="loading-state">
            Loading matchmakings...
          </div>

          <div v-else-if="!data?.length" class="empty-state">
            No matchmakings available.
          </div>

          <div v-else class="matchmaking-list">
            <div
              v-for="matchmaking in data"
              :key="matchmaking.id"
              class="matchmaking-card surface"
            >
              <div class="matchmaking-info">
                <h3 class="matchmaking-name">{{ matchmaking.name }}</h3>
                <p v-if="!matchmaking.enabled" class="disabled-notice">
                  Currently disabled
                </p>
              </div>

              <div class="matchmaking-actions">
                <FancyButton
                  v-if="!isInMatchmaking(matchmaking.name)"
                  :disabled="
                    !matchmaking.enabled ||
                    !!me?.currentJoinedMatchmaking ||
                    !selectedDeckId ||
                    isJoining
                  "
                  :text="isJoining ? 'Joining...' : 'Join'"
                  @click="handleJoin(matchmaking.name)"
                />

                <FancyButton
                  v-else
                  :disabled="isLeaving"
                  :text="isLeaving ? 'Leaving...' : 'Leave'"
                  @click="handleLeave"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss">
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--size-6);
}

.page-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: 2.5rem;
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
  gap: var(--size-6);
  align-items: start;
}

.section-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: 1.5rem;
  font-weight: var(--font-weight-6);
  color: #efef9f;
  margin-bottom: var(--size-4);
  text-align: center;
}

/* Deck Selection Styles */
.deck-selection {
  background: var(--surface-1);
  border-radius: var(--radius-3);
  padding: var(--size-4);
  border: 1px solid #d7ad42;
}

.deck-list {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

.deck-option {
  position: relative;
  cursor: pointer;
  border-radius: var(--radius-2);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.deck-option:hover {
  transform: translateY(-2px);
  border-color: #d7ad42;
}

.deck-option.selected {
  border-color: #efef9f;
  background: rgba(239, 239, 159, 0.1);
}

.selected-indicator {
  position: absolute;
  top: var(--size-2);
  right: var(--size-2);
  background: linear-gradient(45deg, #d7ad42, #efef9f);
  color: hsl(240 100% 5%);
  border-radius: 50%;
  width: var(--size-6);
  height: var(--size-6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-7);
  font-size: var(--font-size-2);
  box-shadow: 0 2px 8px rgba(215, 173, 66, 0.5);
}

/* Matchmaking Section Styles */
.matchmaking-section {
  background: var(--surface-1);
  border-radius: var(--radius-3);
  padding: var(--size-4);
  border: 1px solid #d7ad42;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--size-8);
  color: #a8a8a8;
  font-size: 1.1rem;
}

.matchmaking-list {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}

.matchmaking-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;

  &:has(button:disabled) {
    opacity: 0.5;
  }
}

.matchmaking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px hsl(240 100% 5% / 0.3);
}

.matchmaking-info {
  flex: 1;
}

.matchmaking-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: 1.25rem;
  font-weight: var(--font-weight-6);
  color: #efef9f;
  margin-bottom: var(--size-2);
}

.disabled-notice {
  color: #ff6b6b;
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
}

.matchmaking-actions {
  display: flex;
  gap: var(--size-3);
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

  .matchmaking-actions {
    justify-content: center;
  }
}
</style>
