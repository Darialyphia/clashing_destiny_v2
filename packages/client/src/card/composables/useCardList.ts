import { useSafeInject } from '@/shared/composables/useSafeInject';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { KEYWORDS } from '@game/engine/src/card/card-keywords';
import {
  CARD_KINDS,
  RARITIES,
  type CardKind,
  type Rarity
} from '@game/engine/src/card/card.enums';
import { CARD_SET_DICTIONARY } from '@game/engine/src/card/sets';
import { isFunction, isString } from '@game/shared';
import type { Ref, ComputedRef, InjectionKey } from 'vue';
import { api, type CardId } from '@game/api';
import { useAuthedQuery } from '@/auth/composables/useAuth';
import { useUrlSearchParams } from '@vueuse/core';
import {
  FACTION_ORDER,
  isEligibleForDeckFaction,
  type FactionId
} from '@game/engine/src/card/factions/factions';

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
  getUnownedId(blueprintId: string): CardId;

  hasKindFilter(kind: CardKind): boolean;
  toggleKindFilter(kind: CardKind): void;
  clearKindFilter(): void;

  hasRarityFilter(rarity: Rarity): boolean;
  toggleRarityFilter(rarity: Rarity): void;
  clearRarityFilter(): void;

  manaCostFilter: Ref<{ min: number; max: number } | null>;

  foilFilter: Ref<boolean>;

  // set while editing a deck: only the cards that can go in it are listed
  deckFactionId: Ref<FactionId | null>;
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
    [CARD_KINDS.MINION]: 0,
    [CARD_KINDS.SPELL]: 0,
    [CARD_KINDS.ARTIFACT]: 0,
    [CARD_KINDS.LOCATION]: 1,
    [CARD_KINDS.SECRET]: 0
  };

  const kindFilter = ref(new Set<CardKind>());
  const rarityFilter = ref(new Set<Rarity>());
  const manaCostFilter = ref<{ min: number; max: number } | null>(null);
  const includeUnowned = ref(false);
  const foilFilter = ref(true);
  const deckFactionId = ref<FactionId | null>(null);

  const urlParams = useUrlSearchParams<{
    kinds?: string;
    rarities?: string;
    manaMin?: string;
    manaMax?: string;
    includeUnowned?: string;
    foil?: string;
  }>('history', { removeNullishValues: true });

  const parseFilterSet = <T extends string>(
    value: string | undefined,
    allowedValues: readonly T[]
  ) =>
    new Set(
      value
        ?.split(',')
        .filter((item): item is T => allowedValues.includes(item as T))
    );

  const restoreFiltersFromUrl = () => {
    kindFilter.value = parseFilterSet(
      urlParams.kinds,
      Object.values(CARD_KINDS)
    );
    rarityFilter.value = parseFilterSet(
      urlParams.rarities,
      Object.values(RARITIES)
    );

    const min = Number(urlParams.manaMin);
    const max =
      urlParams.manaMax === undefined ? Infinity : Number(urlParams.manaMax);
    manaCostFilter.value =
      Number.isFinite(min) && (max === Infinity || Number.isFinite(max))
        ? { min, max }
        : null;
    includeUnowned.value = urlParams.includeUnowned === 'true';
  };

  const syncFiltersToUrl = () => {
    urlParams.kinds = [...kindFilter.value].join(',') || undefined;
    urlParams.rarities = [...rarityFilter.value].join(',') || undefined;
    urlParams.manaMin = manaCostFilter.value?.min.toString();
    urlParams.manaMax =
      manaCostFilter.value?.max === Infinity
        ? undefined
        : manaCostFilter.value?.max.toString();
    urlParams.includeUnowned = includeUnowned.value ? 'true' : undefined;
    urlParams.foil = foilFilter.value ? 'true' : undefined;
  };

  restoreFiltersFromUrl();
  watch(
    [
      kindFilter,
      rarityFilter,
      manaCostFilter,
      includeUnowned,
      foilFilter
    ],
    syncFiltersToUrl,
    { deep: true }
  );
  watch(urlParams, restoreFiltersFromUrl, { deep: true });

  const textFilter = ref('');

  const allBlueprints = Object.values(CARD_SET_DICTIONARY).flatMap(
    set => set.cards
  );

  const getUnownedId = (blueprintId: string) =>
    `unowned-${blueprintId}` as CardId;
  const cards = computed(() => {
    if (!myCollection.value) return [];
    const base = [...myCollection.value];
    if (includeUnowned.value) {
      const missing = allBlueprints.filter(bp => {
        return (
          bp.collectable &&
          !myCollection.value!.some(c => c.blueprintId === bp.id)
        );
      });
      base.push(
        ...missing.map(bp => ({
          id: getUnownedId(bp.id),
          blueprintId: bp.id,
          isFoil: false,
          copiesOwned: 0
        }))
      );
    }

    return base
      .map(c => {
        return {
          ...c,
          card: allBlueprints.find(b => b.id === c.blueprintId)!
        };
      })
      .filter(({ card, isFoil }) => {
        if (
          deckFactionId.value &&
          !isEligibleForDeckFaction(card, deckFactionId.value)
        ) {
          return false;
        }

        if (kindFilter.value.size > 0 && !kindFilter.value.has(card.kind)) {
          return false;
        }

        if (
          rarityFilter.value.size > 0 &&
          !rarityFilter.value.has(card.rarity)
        ) {
          return false;
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

        if (!foilFilter.value && isFoil) {
          return false;
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
            (card as any).subKind?.toLocaleLowerCase().includes(searchText) ||
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
        // Locations go at the bottom
        if (KIND_ORDER[a.card.kind] !== KIND_ORDER[b.card.kind]) {
          return KIND_ORDER[a.card.kind] - KIND_ORDER[b.card.kind];
        }

        // then by faction (Neutral last), mana cost and level
        const [keysA, keysB] = [a.card, b.card].map(card => [
          'factionId' in card ? FACTION_ORDER[card.factionId] : 0,
          'manaCost' in card ? card.manaCost : 0,
          'level' in card ? card.level : 0
        ]);
        for (let i = 0; i < keysA.length; i++) {
          if (keysA[i] !== keysB[i]) return keysA[i] - keysB[i];
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
    foilFilter,
    getUnownedId,
    deckFactionId,

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

    hasRarityFilter(rarity: Rarity) {
      return rarityFilter.value.has(rarity);
    },
    toggleRarityFilter(rarity: Rarity) {
      if (rarityFilter.value.has(rarity)) {
        rarityFilter.value.delete(rarity);
      } else {
        rarityFilter.value.add(rarity);
      }
    },
    clearRarityFilter: () => {
      rarityFilter.value.clear();
    },

    manaCostFilter
  };

  provide(CardListInjectionKey, ctx);

  return ctx;
};

export const useCardList = () => useSafeInject(CardListInjectionKey);
