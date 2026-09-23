import {
  provideCardList,
  type CardListContext
} from '@/card/composables/useCardList';
import { DeckBuilderViewModel } from '@/card/deck-builder.model';
import { StandardDeckValidator } from '@game/engine/src/card/validators/standard.validator';
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
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { useResponsive } from '@/shared/composables/useResponsive';

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
  cardScale: Ref<[number]>;
  selectedCard: Ref<
    Nullable<{
      card: CardBlueprint;
      id: string;
      isFoil: boolean;
      copiesOwned: number;
    }>
  >;
  selectCard: (id: string) => void;
  unselectCard: () => void;
  deckEditorOptions: Ref<{ collapseFoil: boolean }>;
};

export const CollectionInjectionKey = Symbol(
  'collection'
) as InjectionKey<CollectionContext>;

export const provideCollectionPage = () => {
  const {
    isLoading,
    cards,
    cardPool,
    hasKindFilter,
    toggleKindFilter,
    clearKindFilter,
    textFilter,
    hasRarityFilter,
    toggleRarityFilter,
    clearRarityFilter,
    hasAffinityFilter,
    toggleAffinityFilter,
    clearAffinityFilter,
    manaCostFilter,
    includeUnowned
  } = provideCardList();

  const { data: decks, isLoading: isLoadingDecks } = useDecks();

  const deckBuilder = ref(
    new DeckBuilderViewModel(
      cardPool,
      new StandardDeckValidator({ cardPool: keyBy(cardPool, 'id') })
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
      cards: newDeck.cards.map(card => ({
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

  const selectedCard = ref<
    Nullable<{
      card: CardBlueprint;
      id: string;
      isFoil: boolean;
      copiesOwned: number;
    }>
  >(null);

  watch(cards, cards => {
    if (selectedCard.value) {
      const updatedCard = cards.find(c => c.id === selectedCard.value!.id);
      if (updatedCard) {
        selectedCard.value = {
          card: cardPool.find(bp => bp.id === updatedCard.blueprintId)!,
          id: updatedCard.id,
          isFoil: updatedCard.isFoil,
          copiesOwned: updatedCard.copiesOwned
        };
      } else {
        selectedCard.value = null;
      }
    }
  });
  const selectCard = (id: string) => {
    const card = cards.value.find(c => c.id === id);

    if (!card) return;
    selectedCard.value = {
      card: cardPool.find(bp => bp.id === card.blueprintId)!,
      id: card.id,
      isFoil: card.isFoil,
      copiesOwned: card.copiesOwned
    };
  };

  const unselectCard = () => {
    selectedCard.value = null;
  };

  const { isSmallViewport } = useResponsive();

  const api: CollectionContext = {
    selectedCard,
    selectCard,
    unselectCard,
    isLoading: computed(() => isLoading.value || isLoadingDecks.value),
    cards,
    includeUnowned,
    cardPool,
    hasKindFilter,
    toggleKindFilter,
    clearKindFilter,
    hasRarityFilter,
    toggleRarityFilter,
    clearRarityFilter,
    hasAffinityFilter,
    toggleAffinityFilter,
    clearAffinityFilter,
    manaCostFilter,
    textFilter,
    viewMode,
    isEditingDeck,
    isSaving: isSavingDeck,
    isDeleting: isDeletingDeck,
    deckBuilder,
    decks,
    cardScale: ref([isSmallViewport.value ? 1.25 : 2]),
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
        cards: deckBuilder.value.deck.cards.map(card => ({
          cardId: card.meta.cardId,
          copies: card.copies
        }))
      });
    },
    deleteDeck: () => {
      if (!selectedDeck.value) return;
      deleteDeck({ deckId: selectedDeck.value.id });
    },
    deckEditorOptions: ref({ collapseFoil: false })
  };

  provide(CollectionInjectionKey, api);
  return api;
};

export const useCollectionPage = () => useSafeInject(CollectionInjectionKey);
