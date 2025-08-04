import { ElusiveModifier } from '../../../../modifier/modifiers/elusive.modiier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { sealAbility } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const flowkeeperSage: MinionBlueprint = {
  id: 'flowkeeperSage',
  name: 'Flowkeeper Sage',
  cardIconId: 'unit-flowkeeper-sage',
  description: `@Elusive@`,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  setId: CARD_SETS.CORE,
  abilities: [
    {
      id: 'ability',
      label: '@[mana 1]@ : mill 2',
      description: `@[mana] 1@ : @Mill 2@. Gain +1 @[attack]@ for each water spell milled this way, then @Seal@ this ability.`,
      canUse: () => true,
      getPreResponseTargets: async () => [],
      manaCost: 1,
      shouldExhaust: false,
      async onResolve(game, card) {
        sealAbility(card, 'ability');
        const milledCards = await card.player.cardManager.mill(2);
        const waterSpells = milledCards.filter(
          c => c.kind === CARD_KINDS.SPELL && c.affinity === AFFINITIES.WATER
        );
        if (!waterSpells.length) return;
        await card.modifiers.add(
          new SimpleAttackBuffModifier('flowkeeperSage', game, card, {
            amount: waterSpells.length
          })
        );
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new ElusiveModifier(game, card));
  },
  async onPlay() {}
};
