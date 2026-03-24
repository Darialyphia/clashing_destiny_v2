import { useSafeInject } from '@/shared/composables/useSafeInject';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { KEYWORDS } from '@game/engine/src/card/card-keywords';
import {
  CARD_KINDS,
  CARD_DECK_SOURCES,
  type CardKind,
  type Job
} from '@game/engine/src/card/card.enums';
import { CARD_SET_DICTIONARY } from '@game/engine/src/card/sets';
import { isFunction, isString } from '@game/shared';
import type { Ref, ComputedRef, InjectionKey } from 'vue';
import { api, type CardId } from '@game/api';
import { useAuthedQuery } from '@/auth/composables/useAuth';

export type CardListContext = {
  isLoading: Ref<boolean>;
  cards: ComputedRef<
    Array<{
      card: CardBlueprint;
      id: string;
      blueprintId: string;
      isFoil: boolean;
      copiesOwned: number;
    }>
  >;
  includeUnowned: Ref<boolean>;
  cardPool: CardBlueprint[];
  textFilter: Ref<string, string>;

  hasKindFilter(kind: CardKind): boolean;
  toggleKindFilter(kind: CardKind): void;
  clearKindFilter(): void;

  hasJobFilter(job: Job): boolean;
  toggleJobFilter(job: Job): void;
  clearJobFilter(): void;

  manaCostFilter: Ref<{ min: number; max: number } | null>;
};

const CardListInjectionKey = Symbol(
  'cardList'
) as InjectionKey<CardListContext>;

export const provideCardList = () => {
  const { isLoading, data: myCollection } = useAuthedQuery(
    api.cards.myCollection,
    {}
  );

  const KIND_ORDER = {
    [CARD_KINDS.HERO]: 1,
    [CARD_KINDS.MINION]: 2,
    [CARD_KINDS.SPELL]: 3,
    [CARD_KINDS.ARTIFACT]: 4,
    [CARD_KINDS.RUNE]: 5
  };

  const kindFilter = ref(new Set<CardKind>());
  const jobFilter = ref(new Set<Job>());
  const manaCostFilter = ref<{ min: number; max: number } | null>(null);
  const includeUnowned = ref(false);

  const textFilter = ref('');

  const allBlueprints = Object.values(CARD_SET_DICTIONARY).flatMap(
    set => set.cards
  );
  const cards = computed(() => {
    if (!myCollection.value) return [];
    const base = includeUnowned.value
      ? myCollection.value.concat(
          allBlueprints
            .filter(bp => {
              return (
                bp.collectable &&
                !myCollection.value!.some(c => c.blueprintId === bp.id)
              );
            })
            .map(bp => ({
              id: `unowned-${bp.id}` as CardId,
              blueprintId: bp.id,
              isFoil: false,
              copiesOwned: 0
            }))
        )
      : myCollection.value;

    return base
      .map(c => {
        return {
          ...c,
          card: allBlueprints.find(b => b.id === c.blueprintId)!
        };
      })
      .filter(({ card }) => {
        if (kindFilter.value.size > 0 && !kindFilter.value.has(card.kind)) {
          return false;
        }

        if (jobFilter.value.size > 0) {
          const isMatch = card.jobs.some(job => jobFilter.value.has(job));
          return isMatch;
        }

        if (manaCostFilter.value !== null) {
          if (!('manaCost' in card)) {
            return false;
          }
          if (
            'manaCost' in card &&
            ((card.manaCost ?? 0) < manaCostFilter.value.min ||
              (card.manaCost ?? 0) > manaCostFilter.value.max)
          ) {
            return false;
          }
        }

        if (textFilter.value) {
          const searchText = textFilter.value.toLocaleLowerCase();
          const description = isFunction(card.description)
            ? card.description()
            : card.description;
          return (
            card.name.toLocaleLowerCase().includes(searchText) ||
            description.toLocaleLowerCase().includes(searchText) ||
            card.tags.some(tag =>
              tag.toLocaleLowerCase().includes(searchText)
            ) ||
            Object.values(KEYWORDS).some(k => {
              return (
                (k.name.toLocaleLowerCase().includes(searchText) &&
                  description.includes(searchText)) ||
                k.aliases.some(alias => {
                  return isString(alias)
                    ? alias.includes(searchText) &&
                        description
                          .toLocaleLowerCase()
                          .includes(alias.toLocaleLowerCase())
                    : searchText.match(alias) &&
                        description.toLocaleLowerCase().match(alias);
                })
              );
            })
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (!a.card) {
          console.log(a);
        }
        if (!b.card) {
          console.log(b);
        }
        if (a.card.deckSource !== b.card.deckSource) {
          return a.card.deckSource === CARD_DECK_SOURCES.MAIN_DECK ? 1 : -1;
        }

        if (
          a.card.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
          b.card.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
          a.card.manaCost !== b.card.manaCost
        ) {
          return a.card.manaCost - b.card.manaCost;
        }

        if (a.card.kind !== b.card.kind) {
          return KIND_ORDER[a.card.kind] - KIND_ORDER[b.card.kind];
        }

        return a.card.name
          .toLocaleLowerCase()
          .localeCompare(b.card.name.toLocaleLowerCase());
      });
  });

  const ctx: CardListContext = {
    isLoading,
    cards,
    cardPool: allBlueprints,
    includeUnowned,
    textFilter,

    hasKindFilter(kind: CardKind) {
      return kindFilter.value.has(kind);
    },
    toggleKindFilter(kind: CardKind) {
      if (kindFilter.value.has(kind)) {
        kindFilter.value.delete(kind);
      } else {
        kindFilter.value.add(kind);
      }
    },
    clearKindFilter: () => {
      kindFilter.value.clear();
    },

    hasJobFilter(job: Job) {
      return jobFilter.value.has(job);
    },
    toggleJobFilter(job: Job) {
      if (jobFilter.value.has(job)) {
        jobFilter.value.delete(job);
      } else {
        jobFilter.value.add(job);
      }
    },
    clearJobFilter: () => {
      jobFilter.value.clear();
    },
    manaCostFilter
  };

  provide(CardListInjectionKey, ctx);

  return ctx;
};

export const useCardList = () => useSafeInject(CardListInjectionKey);
