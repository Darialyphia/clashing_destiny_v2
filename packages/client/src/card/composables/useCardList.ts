import { useSafeInject } from '@/shared/composables/useSafeInject';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { KEYWORDS } from '@game/engine/src/card/card-keywords';
import {
  CARD_KINDS,
  CARD_DECK_SOURCES,
  type CardKind,
  type SpellSchool,
  type CardSpeed,
  type HeroJob
} from '@game/engine/src/card/card.enums';
import { CARD_SET_DICTIONARY } from '@game/engine/src/card/sets';
import { isString } from '@game/shared';
import type { Ref, ComputedRef, InjectionKey } from 'vue';
import { api } from '@game/api';
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
  cardPool: CardBlueprint[];
  textFilter: Ref<string, string>;
  hasSpellSchoolFilter(spellSchool: SpellSchool): boolean;
  toggleSpellSchoolFilter(spellSchool: SpellSchool): void;
  clearSpellSchoolFilter(): void;

  hasKindFilter(kind: CardKind): boolean;
  toggleKindFilter(kind: CardKind): void;
  clearKindFilter(): void;

  hasSpeedFilter(speed: CardSpeed): boolean;
  toggleSpeedFilter(speed: CardSpeed): void;
  clearSpeedFilter(): void;

  hasJobFilter(job: HeroJob): boolean;
  toggleJobFilter(job: HeroJob): void;
  clearJobFilter(): void;
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
    [CARD_KINDS.SIGIL]: 5
  };

  const spellSchoolFilter = ref(new Set<SpellSchool>());
  const kindFilter = ref(new Set<CardKind>());
  const speedFilter = ref(new Set<CardSpeed>());
  const jobFilter = ref(new Set<HeroJob>());

  const textFilter = ref('');

  const allBlueprints = Object.values(CARD_SET_DICTIONARY).flatMap(
    set => set.cards
  );
  const cards = computed(() => {
    if (!myCollection.value) return [];
    return myCollection.value
      .map(c => {
        return {
          ...c,
          card: allBlueprints.find(b => b.id === c.blueprintId)!
        };
      })
      .filter(({ card }) => {
        if (spellSchoolFilter.value.size > 0) {
          const spellSchools =
            card.kind === CARD_KINDS.HERO
              ? card.spellSchools
              : [card.spellSchool];
          const matchspellSchool = [...spellSchoolFilter.value].some(school => {
            return (
              spellSchools.includes(school) ||
              card.description
                .toLocaleLowerCase()
                .includes(school.toLocaleLowerCase())
            );
          });
          if (!matchspellSchool) {
            return false;
          }
        }

        if (jobFilter.value.size > 0) {
          const jobs = card.kind === CARD_KINDS.HERO ? card.jobs : [card.job];
          const matchJob = [...jobFilter.value].some(
            job =>
              jobs.includes(job!) ||
              card.description
                .toLocaleLowerCase()
                .includes(job.toLocaleLowerCase())
          );
          if (!matchJob) {
            return false;
          }
        }

        if (speedFilter.value.size > 0 && !speedFilter.value.has(card.speed)) {
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
            Object.values(KEYWORDS).some(k => {
              return (
                (k.name.toLocaleLowerCase().includes(searchText) &&
                  card.description.includes(searchText)) ||
                k.aliases.some(alias => {
                  return isString(alias)
                    ? alias.includes(searchText) &&
                        card.description
                          .toLocaleLowerCase()
                          .includes(alias.toLocaleLowerCase())
                    : searchText.match(alias) &&
                        card.description.toLocaleLowerCase().match(alias);
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

        if (
          a.card.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
          b.card.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
          a.card.destinyCost !== b.card.destinyCost
        ) {
          return a.card.destinyCost - b.card.destinyCost;
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
    textFilter,
    hasSpellSchoolFilter(affinity: SpellSchool) {
      return spellSchoolFilter.value.has(affinity);
    },
    toggleSpellSchoolFilter(affinity: SpellSchool) {
      if (spellSchoolFilter.value.has(affinity)) {
        spellSchoolFilter.value.delete(affinity);
      } else {
        spellSchoolFilter.value.add(affinity);
      }
    },
    clearSpellSchoolFilter: () => {
      spellSchoolFilter.value.clear();
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
    },
    clearKindFilter: () => {
      kindFilter.value.clear();
    },

    hasSpeedFilter(speed: CardSpeed) {
      return speedFilter.value.has(speed);
    },
    toggleSpeedFilter(speed: CardSpeed) {
      if (speedFilter.value.has(speed)) {
        speedFilter.value.delete(speed);
      } else {
        speedFilter.value.add(speed);
      }
    },
    clearSpeedFilter: () => {
      speedFilter.value.clear();
    },

    hasJobFilter(job: HeroJob) {
      return jobFilter.value.has(job);
    },
    toggleJobFilter(job: HeroJob) {
      if (jobFilter.value.has(job)) {
        jobFilter.value.delete(job);
      } else {
        jobFilter.value.add(job);
      }
    },
    clearJobFilter: () => {
      jobFilter.value.clear();
    }
  };

  provide(CardListInjectionKey, ctx);

  return ctx;
};

export const useCardList = () => useSafeInject(CardListInjectionKey);
