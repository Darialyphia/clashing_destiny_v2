<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import CardText from '@/card/components/CardText.vue';
import { isDefined, isFunction, waitFor } from '@game/shared';
import { provideRichTextContext } from '@/game/composables/useRichText';
import { unrefElement } from '@vueuse/core';
import CardDetailsModalFooter from './CardDetailsModalFooter.vue';
import { useCollectionPage } from '../useCollectionPage';
import UiIconButton from '@/ui/components/UiIconButton.vue';

const { selectedCard, selectCard, unselectCard, cards } = useCollectionPage();

const isOpened = computed({
  get() {
    return isDefined(selectedCard.value);
  },
  set() {
    animateCardOut();

    nextTick(() => {
      unselectCard();
    });
  }
});

const selectedCardIndex = computed(() => {
  if (!selectedCard.value) return -1;
  return cards.value.findIndex(card => card.id === selectedCard.value!.id);
});

const hasPreviousCard = computed(() => selectedCardIndex.value > 0);
const hasNextCard = computed(
  () =>
    selectedCardIndex.value >= 0 &&
    selectedCardIndex.value < cards.value.length - 1
);

const selectPreviousCard = () => {
  if (!hasPreviousCard.value) return;
  selectCard(cards.value[selectedCardIndex.value - 1].id);
};

const selectNextCard = () => {
  if (!hasNextCard.value) return;
  selectCard(cards.value[selectedCardIndex.value + 1].id);
};

const description = computed(() => {
  if (!selectedCard.value) return '';
  return isFunction(selectedCard.value.card.description)
    ? selectedCard.value.card.description()
    : selectedCard.value.card.description;
});

provideRichTextContext({
  card: ref(null)
});

const cardRoot = useTemplateRef('root');

const shouldDisplayCard = ref(false);

const getCardAnimationElements = () => {
  if (!selectedCard.value) return null;
  const collectionCard = document.querySelector<HTMLElement>(
    `[data-flip-id="collection-card-${selectedCard.value.id}"]`
  );
  const modalCardWrapper = unrefElement(cardRoot);
  const modalCard = modalCardWrapper?.querySelector<HTMLElement>('.card');

  if (!collectionCard || !modalCardWrapper || !modalCard) return null;

  return { collectionCard, modalCardWrapper, modalCard };
};

const getFlipTransform = (source: DOMRect, target: DOMRect) => ({
  x: source.left - target.left,
  y: source.top - target.top,
  scaleX: source.width / target.width,
  scaleY: source.height / target.height
});

const snapElementToRect = (
  el: HTMLElement,
  fromRect: DOMRect,
  toRect: DOMRect
) => {
  const transforms = getFlipTransform(fromRect, toRect);

  el.style.transformOrigin = 'top left';
  el.style.transform = `translate(${transforms.x}px, ${transforms.y}px) scale(${transforms.scaleX}, ${transforms.scaleY})`;
};

const animateCardIn = async () => {
  shouldDisplayCard.value = true;
  await nextTick();

  const elements = getCardAnimationElements();
  if (!elements) return;

  const { collectionCard, modalCardWrapper, modalCard } = elements;

  snapElementToRect(
    modalCardWrapper,
    collectionCard.getBoundingClientRect(),
    modalCardWrapper.getBoundingClientRect()
  );
  modalCard.style.transformOrigin = 'center';
  modalCard.style.transform = `rotateY(360deg)`;

  await nextTick();
  modalCardWrapper.style.transform = '';
  modalCardWrapper.style.transition = 'transform 0.3s var(--ease-in-out-4)';
  modalCard.style.transition = 'transform 1s var(--ease-in-out-4)';

  modalCardWrapper.addEventListener(
    'transitionend',
    () => {
      modalCardWrapper.style.transition = '';
      modalCardWrapper.style.transformOrigin = '';
    },
    { once: true }
  );
  modalCard.addEventListener(
    'transitionend',
    () => {
      modalCard.style.transform = '';
      modalCard.style.transition = '';
      modalCard.style.transformOrigin = '';
    },
    { once: true }
  );
};

const animateCardOut = async () => {
  shouldDisplayCard.value = false;
  const elements = getCardAnimationElements();

  if (!elements) return;

  const { collectionCard, modalCardWrapper, modalCard } = elements;

  snapElementToRect(
    collectionCard,
    modalCardWrapper.getBoundingClientRect(),
    collectionCard.getBoundingClientRect()
  );
  modalCard.style.transformOrigin = 'center';
  modalCard.style.transform = `rotateY(0deg)`;

  const zIndexAncestor = collectionCard.closest<HTMLElement>(
    'li[data-collection-card-id]'
  );
  if (zIndexAncestor) {
    zIndexAncestor.style.zIndex = '1000';
  }

  await waitFor(50);
  collectionCard.style.transition = 'transform 0.3s var(--ease-in-out-4)';
  collectionCard.style.transform = '';
  collectionCard.addEventListener(
    'transitionend',
    () => {
      collectionCard.style.transition = '';
      collectionCard.style.transformOrigin = '';
      if (zIndexAncestor) {
        zIndexAncestor.style.zIndex = '';
      }
    },
    { once: true }
  );
  modalCard.addEventListener(
    'transitionend',
    () => {
      modalCard.style.transform = '';
      modalCard.style.transition = '';
      modalCard.style.transformOrigin = '';
    },
    { once: true }
  );
};
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    :title="selectedCard?.card.name ?? ''"
    :description="description"
    :style="{ '--ui-modal-size': 'var(--size-lg)' }"
    :animated="false"
    @open-animation-end="animateCardIn"
  >
    <article class="card-details" v-if="selectedCard">
      <UiIconButton
        class="nav-button nav-button-previous"
        icon="material-symbols:arrow-back-2-outline"
        :disabled="!hasPreviousCard"
        @click="selectPreviousCard"
      />

      <UiIconButton
        class="nav-button nav-button-next"
        icon="material-symbols:arrow-back-2-outline"
        aria-label="Next card"
        :disabled="!hasNextCard"
        @click="selectNextCard"
      />

      <aside class="card-preview">
        <div ref="root">
          <BlueprintCard
            v-if="shouldDisplayCard"
            :data-flip-id="`collection-card-modal-${selectedCard.card.id}`"
            :blueprint="selectedCard.card"
            show-stats
            :is-foil="selectedCard.isFoil"
          />
        </div>
      </aside>

      <Transition appear>
        <section class="card-info surface">
          <header>
            <h2>{{ selectedCard.card.name }}</h2>
            <span
              class="rarity-badge"
              :style="{
                '--rarity-color': `var(--rarity-${selectedCard.card.rarity.toLowerCase()})`
              }"
            >
              {{ selectedCard.card.rarity }}
            </span>
            <p class="metadata">
              <span class="set-id">{{ selectedCard.card.setId }}</span>
              <span class="separator">•</span>
              <span class="copies-count">
                {{ selectedCard.copiesOwned }}
                {{ selectedCard.copiesOwned === 1 ? 'copy' : 'copies' }} owned
              </span>
            </p>
          </header>

          <section class="description">
            <h3>Description</h3>
            <CardText :text="description" />
          </section>

          <section
            v-if="
              'abilities' in selectedCard.card &&
              selectedCard.card.abilities?.length
            "
            class="abilities"
          >
            <h3>Abilities</h3>
            <ul>
              <li
                v-for="(ability, index) in selectedCard.card.abilities"
                :key="index"
              >
                <CardText :text="ability.description" />
              </li>
            </ul>
          </section>

          <CardDetailsModalFooter :card="selectedCard" />
        </section>
      </Transition>
    </article>
  </UiModal>
</template>

<style scoped lang="postcss">
/* .card-enter-active,
.card-leave-active {
  transition: rotate 1s var(--ease-spring-3);
}
.card-enter-from {
  rotate: 45deg;
} */

.card-details {
  position: relative;
  display: flex;
  gap: var(--size-5);
  min-height: var(--size-13);
}

.nav-button {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size-8);
  height: var(--size-8);
  border-radius: var(--radius-round);
  background: var(--surface-2);
  border: var(--border-size-1) solid var(--border-dimmed);
  color: var(--text-1);
  font-size: var(--font-size-6);
  line-height: 1;
  transition:
    background 0.15s var(--ease-3),
    opacity 0.15s var(--ease-3);

  &:hover:not(:disabled) {
    background: var(--surface-3);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.nav-button-previous {
  left: calc(-1 * var(--size-9));
}

.nav-button-next {
  right: calc(-1 * var(--size-9));
  rotate: 180deg;
}

.card-preview {
  --pixel-scale: 3;
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  min-height: calc(var(--card-v3-height) * var(--pixel-scale));
  aspect-ratio: var(--card-v3-ratio);
}

.card-info {
  --card-text-color: currentColor;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  min-width: 0;

  &.v-enter-active,
  &.v-leave-active {
    transition: opacity 0.3s var(--ease-3);
  }

  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
  }
}

.card-info > header {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  padding-block-end: var(--size-3);
  border-block-end: var(--border-size-1) solid var(--border-dimmed);
}

.card-info h2 {
  margin: 0;
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  color: var(--text-1);
  line-height: var(--font-lineheight-2);
}

.rarity-badge {
  display: inline-block;
  padding: var(--size-1) var(--size-3);
  background: var(--rarity-color);
  color: var(--text-on-primary);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  text-transform: uppercase;
  letter-spacing: var(--font-letterspacing-3);
  border-radius: var(--radius-2);
  width: fit-content;
  box-shadow: var(--shadow-2);
}

.metadata {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-size: var(--font-size-1);
  color: var(--text-2);
}

.set-id {
  font-weight: var(--font-weight-6);
  text-transform: uppercase;
  letter-spacing: var(--font-letterspacing-1);
}

.separator {
  opacity: 0.5;
}

.copies-count {
  font-variant-numeric: tabular-nums;
}

.card-info section {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
}

.card-info h3 {
  margin: 0;
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  text-transform: uppercase;
  letter-spacing: var(--font-letterspacing-2);
}

.description {
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  border: var(--border-size-1) solid var(--border-subtle);
}

.abilities ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

.abilities li {
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  border-inline-start: var(--border-size-3) solid var(--primary);
  transition: background var(--ease-3) var(--speed-2);
}

.abilities li:hover {
  background: var(--surface-3);
}

@media (max-width: 768px) {
  .card-details {
    flex-direction: column;
    gap: var(--size-4);
  }

  .card-preview {
    align-self: center;
  }
}
</style>
