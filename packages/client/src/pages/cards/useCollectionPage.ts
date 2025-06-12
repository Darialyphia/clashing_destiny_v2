import {
  provideCardList,
  type CardListContext
} from '@/card/composables/useCardList';
import { DeckBuilderViewModel } from '@/card/deck-builder.model';
import {
  StandardDeckValidator,
  type ValidatableDeck
} from '@game/engine/src/card/validators/deck.validator';
import { useLocalStorage } from '@vueuse/core';
import type { Ref, InjectionKey } from 'vue';
import { keyBy } from 'lodash-es';
import { useSafeInject } from '@/shared/composables/useSafeInject';

export type CollectionContext = CardListContext & {
  viewMode: Ref<'expanded' | 'compact'>;
  isEditingDeck: Ref<boolean>;
  deckBuilder: Ref<DeckBuilderViewModel>;
  createDeck: () => void;
  decks: Ref<ValidatableDeck[]>;
  editDeck: (deck: ValidatableDeck) => void;
  saveDeck: () => void;
};

export const CollectionInjectionKey = Symbol(
  'collection'
) as InjectionKey<CollectionContext>;

export const provideCollectionPage = () => {
  const {
    cards,
    hasAffinityFilter,
    toggleAffinityFilter,
    hasKindFilter,
    toggleKindFilter,
    textFilter
  } = provideCardList();

  const decks = useLocalStorage<ValidatableDeck[]>(
    'clashing-destinies-decks',
    []
  );
  const collection = computed(() =>
    cards.value.map(card => ({ blueprint: card, copiesOwned: 4 }))
  );

  const deckBuilder = ref(
    new DeckBuilderViewModel(
      collection.value,
      new StandardDeckValidator(keyBy(cards.value, 'id'))
    )
  ) as Ref<DeckBuilderViewModel>;

  const isEditing = ref(false);
  const createDeck = () => {
    deckBuilder.value.reset();
    isEditing.value = true;
  };

  const editDeck = (deck: ValidatableDeck) => {
    deckBuilder.value.loadDeck(deck);
    isEditing.value = true;
  };

  const saveDeck = () => {
    const existingDeck = decks.value.find(
      deck => deck.id === deckBuilder.value.deck.id
    );
    if (existingDeck) {
      existingDeck.name = deckBuilder.value.deck.name;
      existingDeck.mainDeck = deckBuilder.value.deck.mainDeck;
      existingDeck.destinyDeck = deckBuilder.value.deck.destinyDeck;
    } else {
      decks.value.push(deckBuilder.value.deck);
    }
    isEditing.value = false;
    deckBuilder.value.reset();
  };

  const viewMode = ref<'expanded' | 'compact'>('expanded');

  const api: CollectionContext = {
    cards,
    hasAffinityFilter,
    toggleAffinityFilter,
    hasKindFilter,
    toggleKindFilter,
    textFilter,
    viewMode,
    isEditingDeck: isEditing,
    deckBuilder,
    decks,
    createDeck,
    editDeck,
    saveDeck
  };

  provide(CollectionInjectionKey, api);
  return api;
};

export const useCollectionPage = () => useSafeInject(CollectionInjectionKey);
