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

export const theHangedMan: DestinyBlueprint = {
  id: 'the-hanged-man',
  name: 'The Hanged Man',
  cardIconId: 'talent-the-hangman',
  description: '.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 3,
  countsAsLevel: true,
  abilities: [
    {
      id: 'the-hanged-man-ability',
      label: 'Swap minion positions',
      description:
        '@[exhaust]@ @[mana] 4@ : Move minions in the attack zone to the defense zone, and vice versa. @Seal@ this ability.',
      manaCost: 4,
      shouldExhaust: true,
      canUse: () => true,
      getPreResponseTargets: async () => [],
      async onResolve(game, card) {
        const handledMinions = new Set<MinionCard>();
        const allMinions = [...card.player.minions, ...card.player.opponent.minions];
        for (const minion of allMinions) {
          if (handledMinions.has(minion)) continue;
          handledMinions.add(minion);
          const targetPosition =
            minion.position!.zone === 'attack'
              ? minion.slot!.behind!
              : minion.slot!.inFront!;

          if (targetPosition.isOccupied) {
            handledMinions.add(targetPosition.minion!);
          }

          await minion.moveTo(targetPosition, true);
        }
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
