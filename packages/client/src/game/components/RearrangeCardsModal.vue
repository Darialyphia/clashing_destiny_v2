<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useGameClient, useGameState } from '../composables/useGameClient';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const { client, playerId } = useGameClient();
const _isOpened = ref(false);
const state = useGameState();

const isOpened = computed({
  get() {
    return _isOpened.value && !isShowingBoard.value;
  },
  set(value: boolean) {
    _isOpened.value = value;
  }
});

const isShowingBoard = ref(false);

const result = ref<Array<{ id: string; cards: string[]; label: string }>>([]);

const refreshBuckets = () => {
  result.value = result.value.map(bucket => ({
    ...bucket,
    cards: [...bucket.cards]
  }));
};

const moveCardWithinBucket = (
  bucketIndex: number,
  cardIndex: number,
  direction: -1 | 1
) => {
  const bucket = result.value[bucketIndex];
  if (!bucket) return;

  const newIndex = cardIndex + direction;
  if (newIndex < 0 || newIndex >= bucket.cards.length) return;

  const cards = [...bucket.cards];
  const [card] = cards.splice(cardIndex, 1);
  if (!card) return;
  cards.splice(newIndex, 0, card);
  bucket.cards = cards;
  refreshBuckets();
};

const moveCardToBucket = (
  sourceBucketIndex: number,
  cardIndex: number,
  targetBucketIndex: number
) => {
  if (sourceBucketIndex === targetBucketIndex) return;
  const sourceBucket = result.value[sourceBucketIndex];
  const targetBucket = result.value[targetBucketIndex];
  if (!sourceBucket || !targetBucket) return;

  const sourceCards = [...sourceBucket.cards];
  const [card] = sourceCards.splice(cardIndex, 1);
  if (!card) return;

  sourceBucket.cards = sourceCards;
  targetBucket.cards = [...targetBucket.cards, card];
  refreshBuckets();
};

const interactionState = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.REARRANGING_CARDS) {
    return null;
  }
  return state.value.interaction.ctx;
});

watch(interactionState, state => {
  if (!state) return;
  if (playerId.value !== client.value.getActivePlayerId()) return;
  result.value = state.buckets.map(bucket => ({
    label: bucket.label,
    id: bucket.id,
    cards: [...bucket.cards]
  }));

  _isOpened.value = true;
});

watch(_isOpened, () => {
  if (!_isOpened.value) {
    result.value = [];
  }
});

const label = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.REARRANGING_CARDS)
    return '';
  return state.value.interaction.ctx.label;
});
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="Destiny Phase"
    description="Rearrange your cards"
    :closable="false"
    :style="{
      '--ui-modal-size': 'var(--size-xl)'
    }"
  >
    <div class="content">
      <p class="text-5 mb-4" v-if="!isShowingBoard">
        {{ label }}
      </p>
      <div class="buckets fancy-scrollbar">
        <div
          v-for="(bucket, bucketIndex) in result"
          :key="bucket.id"
          class="bucket"
        >
          <div>{{ bucket.label }}</div>
          <ul>
            <li v-for="(card, index) in bucket.cards" :key="card">
              <InspectableCard :card-id="card" side="top">
                <GameCard
                  :card-id="card"
                  show-stats
                  variant="small"
                  :is-interactive="false"
                />
              </InspectableCard>
              <div class="card-actions">
                <div>
                  <FancyButton
                    :disabled="index === 0"
                    text="Prev"
                    size="sm"
                    @click="moveCardWithinBucket(bucketIndex, index, -1)"
                  />
                  <FancyButton
                    :disabled="index === bucket.cards.length - 1"
                    text="Next"
                    size="sm"
                    @click="moveCardWithinBucket(bucketIndex, index, 1)"
                  />
                </div>
                <div>
                  <FancyButton
                    v-if="bucketIndex !== 0"
                    size="sm"
                    :text="`to ${result[bucketIndex - 1].label}`"
                    variant="info"
                    @click="
                      moveCardToBucket(bucketIndex, index, bucketIndex - 1)
                    "
                  />
                  <FancyButton
                    v-if="bucketIndex !== result.length - 1"
                    size="sm"
                    :text="`to ${result[bucketIndex + 1].label}`"
                    variant="info"
                    @click="
                      moveCardToBucket(bucketIndex, index, bucketIndex + 1)
                    "
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton
          v-if="!isShowingBoard"
          variant="info"
          text="Confirm"
          @click="
            _isOpened = false;
            client.commitRearrangeCards(result);
          "
        />
      </footer>
    </div>
  </UiModal>
  <Teleport to="body">
    <FancyButton
      v-if="_isOpened || isShowingBoard"
      class="board-toggle"
      :text="isShowingBoard ? 'Hide Board' : 'Show Board'"
      @click="isShowingBoard = !isShowingBoard"
    />
  </Teleport>
</template>

<style scoped lang="postcss">
.board-toggle {
  position: fixed;
  bottom: var(--size-8);
  right: var(--size-8);
  z-index: 50;
  pointer-events: auto;
}

.buckets {
  --pixel-scale: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.bucket {
  ul {
    display: flex;
    gap: var(--size-4);
    flex-wrap: wrap;
  }
}

.card-actions {
  margin-top: var(--size-4);
  gap: var(--size-2);
  > div {
    display: flex;
    justify-content: center;
    gap: var(--size-2);
  }
}
</style>
