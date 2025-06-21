import type {
  Ability,
  PreResponseTarget,
  TalentBlueprint
} from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import { novice } from '../heroes/novice';

export const theHangman: TalentBlueprint = {
  id: 'the-hangman',
  name: 'The Hangman',
  cardIconId: 'talent-the-hangman',
  description:
    '@On Enter@: Give your Hero: @[exhaust]@ @[mana] 4@: Switch the zone of all minions, then @Seal@ this ability.',
  affinity: AFFINITIES.NORMAL,
  collectable: true,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  destinyCost: 1,
  level: 2,
  heroId: novice.id,
  rarity: RARITIES.EPIC,
  kind: CARD_KINDS.TALENT,
  setId: CARD_SETS.CORE,
  tags: [],
  async onInit() {},
  async onPlay(game, card) {
    const abilityId = 'the-hangman';
    const ability: Ability<HeroCard, PreResponseTarget> = {
      id: abilityId,
      label: 'The Hangman',
      description:
        '@[exhaust]@ @[mana] 4@: Switch the zone of all minions, then Seal this ability.',
      canUse: () => true,
      shouldExhaust: true,
      manaCost: 4,
      getPreResponseTargets: async () => [],
      async onResolve(game, card) {
        if (!card.player.hero) {
          return;
        }
        // Switch the zone of all minions
        const allMinions = [...card.player.minions, ...card.player.opponent.minions];
        const handledMinions = new Set<string>();
        for (const minion of allMinions) {
          // Skip if the minion has already been handled
          if (handledMinions.has(minion.id)) {
            continue;
          }
          const destination = card.player.boardSide.getSlot(
            minion.position!.zone === 'attack' ? 'defense' : 'attack',
            minion.position!.slot
          )!;
          const otherMinion = destination.minion;
          if (otherMinion) {
            // If there is another minion in the destination slot, we need to handle it first
            handledMinions.add(otherMinion.id);
          }

          minion.player.boardSide.moveMinion(
            minion.position!,
            {
              zone: minion.position!.zone === 'attack' ? 'defense' : 'attack',
              slot: minion.position!.slot
            },
            { allowSwap: true }
          );
        }

        await card.player.hero.addInterceptor('canUseAbility', (val, ctx) => {
          if (ctx.ability.id === abilityId) {
            return false;
          }
          return val;
        });
      }
    };
    await card.player.hero.addInterceptor('abilities', val => [...val, ability]);
  }
};
