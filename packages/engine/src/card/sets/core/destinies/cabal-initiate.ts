import type { DestinyBlueprint } from '../../../card-blueprint';
import { sealAbility, singleMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const cabalInitiate: DestinyBlueprint = {
  id: 'cabal-initiate',
  name: 'Cabal Initiate',
  cardIconId: 'talent-cabal-initiate',
  description: '',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 2,
  countsAsLevel: true,
  abilities: [
    {
      id: 'cabal-initiate-ability',
      label: '@[mana] 2@ Destroy a minion',
      description:
        '@[exhaust]@ @[mana] 2@ :  Destroy a minion that costs 2 or less. @Seal@ this ability.',
      manaCost: 2,
      shouldExhaust: true,
      canUse: (game, card) =>
        card.location === 'board' &&
        singleMinionTargetRules.canPlay(game, card, minion => minion.manaCost <= 2),
      getPreResponseTargets: (game, card) =>
        singleMinionTargetRules.getPreResponseTargets(game, card, {
          type: 'ability',
          card,
          abilityId: 'cabal-initiate-ability'
        }),
      async onResolve(game, card, targets) {
        const target = targets[0] as MinionCard;
        await target.destroy();
        sealAbility(card, 'cabal-initiate-ability');
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
