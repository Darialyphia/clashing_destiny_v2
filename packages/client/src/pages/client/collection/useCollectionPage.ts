import {
  provideCardList,
  type CardListContext
} from '@/card/composables/useCardList';
import { DeckBuilderViewModel } from '@/card/deck-builder.model';
import { StandardDeckValidator } from '@game/engine/src/card/validators/deck.validator';
import type { Ref, InjectionKey } from 'vue';
import { keyBy } from 'lodash-es';
import { useSafeInject } from '@/shared/composables/useSafeInject';
import {
  useCreateDeck,
  useDecks,
  useDeleteDeck,
  useUpdateDeck,
  type UserDeck
} from '@/card/composables/useDecks';
import type { Nullable } from '@game/shared';
import type { DeckId } from '@game/api';

export type CollectionContext = CardListContext & {
  viewMode: Ref<'expanded' | 'compact'>;
  isEditingDeck: Ref<boolean>;
  deckBuilder: Ref<DeckBuilderViewModel>;
  decks: Ref<UserDeck[]>;
  createDeck: () => void;
  editDeck: (id: DeckId) => void;
  stopEditingDeck: () => void;
  saveDeck: () => void;
  isSaving: Ref<boolean>;
  deleteDeck: () => void;
  isDeleting: Ref<boolean>;
};

export const CollectionInjectionKey = Symbol(
  'collection'
) as InjectionKey<CollectionContext>;

export const provideCollectionPage = () => {
  const {
    isLoading,
    cards,
    cardPool,
    hasSpellSchoolFilter,
    toggleSpellSchoolFilter,
    hasKindFilter,
    toggleKindFilter,
    clearSpellSchoolFilter,
    clearKindFilter,
    textFilter,
    hasSpeedFilter,
    toggleSpeedFilter,
    clearSpeedFilter,
    hasJobFilter,
    toggleJobFilter,
    clearJobFilter
  } = provideCardList();

  const { data: decks, isLoading: isLoadingDecks } = useDecks();

  const deckBuilder = ref(
    new DeckBuilderViewModel(
      cardPool,
      new StandardDeckValidator(keyBy(cardPool, 'id'))
    )
  ) as Ref<DeckBuilderViewModel>;

  const selectedDeckId = ref<Nullable<DeckId>>(null);
  const selectedDeck = computed(
    () => decks.value?.find(deck => deck.id === selectedDeckId.value) || null
  );
  watch(selectedDeck, newDeck => {
    if (!newDeck) {
      deckBuilder.value.reset();
      return;
    }
    deckBuilder.value.loadDeck({
      name: newDeck.name,
      id: newDeck.id,
      isEqual(first, second) {
        return first.meta.cardId === second.meta.cardId;
      },
      spellSchools: newDeck.spellSchools,
      mainDeck: newDeck.mainDeck.map(card => ({
        blueprintId: card.blueprintId,
        copies: card.copies,
        meta: {
          isFoil: card.isFoil,
          cardId: card.cardId
        }
      })),
      destinyDeck: newDeck.destinyDeck.map(card => ({
        blueprintId: card.blueprintId,
        copies: card.copies,
        meta: {
          isFoil: card.isFoil,
          cardId: card.cardId
        }
      }))
    });
  });

  const isEditingDeck = computed(() => selectedDeckId.value !== null);
  const { mutate: createDeck } = useCreateDeck(({ deckId }) => {
    selectedDeckId.value = deckId as DeckId;
    deckBuilder.value.reset();
  });
  const { mutate: saveDeck, isLoading: isSavingDeck } = useUpdateDeck(() => {
    selectedDeckId.value = null;
    deckBuilder.value.reset();
  });

  const { mutate: deleteDeck, isLoading: isDeletingDeck } = useDeleteDeck(
    () => {
      selectedDeckId.value = null;
      deckBuilder.value.reset();
    }
  );

  const viewMode = ref<'expanded' | 'compact'>('expanded');

  const api: CollectionContext = {
    isLoading: computed(() => isLoading.value || isLoadingDecks.value),
    cards,
    cardPool,
    hasSpellSchoolFilter,
    toggleSpellSchoolFilter,
    clearSpellSchoolFilter,
    hasKindFilter,
    toggleKindFilter,
    clearKindFilter,
    hasSpeedFilter,
    toggleSpeedFilter,
    clearSpeedFilter,
    hasJobFilter,
    toggleJobFilter,
    clearJobFilter,
    textFilter,
    viewMode,
    isEditingDeck,
    isSaving: isSavingDeck,
    isDeleting: isDeletingDeck,
    deckBuilder,
    decks,
    createDeck: () => createDeck({}),
    editDeck: id => {
      selectedDeckId.value = id;
    },
    stopEditingDeck: () => {
      selectedDeckId.value = null;
      deckBuilder.value.reset();
    },
    saveDeck: () => {
      if (!selectedDeck.value) return;
      saveDeck({
        deckId: selectedDeck.value.id,
        name: deckBuilder.value.deck.name,
        spellSchools: deckBuilder.value.deck.spellSchools,
        mainDeck: deckBuilder.value.deck.mainDeck.map(card => ({
          cardId: card.meta.cardId,
          copies: card.copies
        })),
        destinyDeck: deckBuilder.value.deck.destinyDeck.map(card => ({
          cardId: card.meta.cardId,
          copies: card.copies
        }))
      });
    },
    deleteDeck: () => {
      if (!selectedDeck.value) return;
      deleteDeck({ deckId: selectedDeck.value.id });
    }
  };

  provide(CollectionInjectionKey, api);
  return api;
};

export const useCollectionPage = () => useSafeInject(CollectionInjectionKey);
