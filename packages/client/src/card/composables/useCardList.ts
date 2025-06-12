import { KEYWORDS } from '@game/engine/src/card/card-keywords';
import {
  CARD_KINDS,
  CARD_DECK_SOURCES,
  type Affinity,
  type CardKind
} from '@game/engine/src/card/card.enums';
import { type CardSet, CARD_SET_DICTIONARY } from '@game/engine/src/card/sets';
import { isString } from '@game/shared';

export const useCardList = () => {
  const authorizedSets: CardSet[] = [CARD_SET_DICTIONARY.CORE];

  const KIND_ORDER = {
    [CARD_KINDS.HERO]: 1,
    [CARD_KINDS.TALENT]: 2,
    [CARD_KINDS.MINION]: 3,
    [CARD_KINDS.SPELL]: 4,
    [CARD_KINDS.ATTACK]: 5,
    [CARD_KINDS.ARTIFACT]: 6,
    [CARD_KINDS.LOCATION]: 7
  };

  const affinityFilter = ref(new Set<Affinity>());
  const kindFilter = ref(new Set<CardKind>());

  const textFilter = ref('');

  const cards = computed(() => {
    return authorizedSets
      .map(set => set.cards)
      .flat()
      .filter(card => {
        if (!card.collectable) {
          return false;
        }
        if (
          affinityFilter.value.size > 0 &&
          !affinityFilter.value.has(card.affinity)
        ) {
          return false;
        }

        if (kindFilter.value.size > 0 && !kindFilter.value.has(card.kind)) {
          return false;
        }

        if (textFilter.value) {
          const searchText = textFilter.value.toLocaleLowerCase();
          return (
            card.name.toLocaleLowerCase().includes(searchText) ||
            card.description.toLocaleLowerCase().includes(searchText) ||
            card.tags.some(tag =>
              tag.toLocaleLowerCase().includes(searchText)
            ) ||
            Object.values(KEYWORDS).some(
              k =>
                k.name.toLocaleLowerCase().includes(searchText) ||
                k.aliases.some(alias => {
                  return isString(alias)
                    ? searchText
                        .toLocaleLowerCase()
                        .match(alias.toLocaleLowerCase())
                    : searchText.toLocaleLowerCase().match(alias);
                })
            )
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (a.deckSource !== b.deckSource) {
          return a.deckSource === CARD_DECK_SOURCES.MAIN_DECK ? 1 : -1;
        }

        if (a.kind === b.kind) {
          if (
            a.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
            b.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
            a.manaCost !== b.manaCost
          ) {
            return a.manaCost - b.manaCost;
          }

          if (
            a.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
            b.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
            a.destinyCost !== b.destinyCost
          ) {
            return a.destinyCost - b.destinyCost;
          }
          return a.name
            .toLocaleLowerCase()
            .localeCompare(b.name.toLocaleLowerCase());
        }
        return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
      });
  });

  return {
    cards,
    textFilter,
    hasAffinityFilter(affinity: Affinity) {
      return affinityFilter.value.has(affinity);
    },
    toggleAffinityFilter(affinity: Affinity) {
      if (affinityFilter.value.has(affinity)) {
        affinityFilter.value.delete(affinity);
      } else {
        affinityFilter.value.add(affinity);
      }
    },
    hasKindFilter(kind: CardKind) {
      return kindFilter.value.has(kind);
    },
    toggleKindFilter(kind: CardKind) {
      if (kindFilter.value.has(kind)) {
        kindFilter.value.delete(kind);
      } else {
        kindFilter.value.add(kind);
      }
    }
  };
};
