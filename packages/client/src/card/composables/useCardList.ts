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
import { type CardSet, CARD_SET_DICTIONARY } from '@game/engine/src/card/sets';
import { isString } from '@game/shared';
import type { Ref, ComputedRef, InjectionKey } from 'vue';

export type CardListContext = {
  cards: ComputedRef<CardBlueprint[]>;
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
  const authorizedSets: CardSet[] = [CARD_SET_DICTIONARY.CORE];

  const KIND_ORDER = {
    [CARD_KINDS.HERO]: 1,
    [CARD_KINDS.MINION]: 2,
    [CARD_KINDS.SPELL]: 3,
    [CARD_KINDS.ARTIFACT]: 4
  };

  const spellSchoolFilter = ref(new Set<SpellSchool>());
  const kindFilter = ref(new Set<CardKind>());
  const speedFilter = ref(new Set<CardSpeed>());
  const jobFilter = ref(new Set<HeroJob>());

  const textFilter = ref('');

  const cards = computed(() => {
    return authorizedSets
      .map(set => set.cards)
      .flat()
      .filter(card => {
        console.log(card.id, card.collectable);
        if (!card.collectable) return false;

        if (spellSchoolFilter.value.size > 0) {
          const spellSchools =
            card.kind === CARD_KINDS.HERO
              ? card.spellSchools
              : [card.spellSchool];
          if (spellSchools.every(s => !spellSchoolFilter.value.has(s!))) {
            return false;
          }
        }

        if (jobFilter.value.size > 0) {
          const jobs = card.kind === CARD_KINDS.HERO ? card.jobs : [card.job];
          if (jobs.every(j => !jobFilter.value.has(j!))) {
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

  const api: CardListContext = {
    cards,
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

  provide(CardListInjectionKey, api);

  return api;
};

export const useCardList = () => useSafeInject(CardListInjectionKey);
