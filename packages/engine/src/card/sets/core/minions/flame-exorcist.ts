import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.card';

export const flameExorcist: MinionBlueprint = {
  id: 'flameExorcist',
  name: 'Flame Exorcist',
  cardIconId: 'unit-flame-exorcist',
  description: ``,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [
    {
      id: 'ability',
      label: 'Burn minion',
      description: `@[exhaust]@ Inflict @Burn@ to a minion.`,
      canUse: game =>
        game.boardSystem.sides.some(side => side.getAllMinions().length > 0),
      getPreResponseTargets(game, card) {
        return singleMinionTargetRules.getPreResponseTargets(game, card);
      },
      manaCost: 0,
      shouldExhaust: true,
      async onResolve(game, card) {
        for (const target of card.abilityTargets.get('ability')!) {
          if (target instanceof MinionCard) {
            await target.modifiers.add(new BurnModifier(game, card));
          }
        }
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
