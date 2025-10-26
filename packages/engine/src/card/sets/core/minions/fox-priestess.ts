import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { singleEnemyMinionTargetRules } from '../../../card-utils';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { MinionCard } from '../../../entities/minion.entity';

export const foxPriestess: MinionBlueprint = {
  id: 'fox-priestess',
  name: 'Fox Priestess',
  cardIconId: 'minions/fox-priestess',
  description: dedent`
  @[level] 1 bonus@ : @On Enter@ : if you have the same amount of cards in your hand and Destiny Zone, exhaust an enemy minion and draw a card.`,
  collectable: true,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 1)
    )) as LevelBonusModifier<MinionCard>;

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          if (!levelMod.isActive) return;
          if (
            card.player.cardManager.hand.length !==
            card.player.cardManager.destinyZone.size
          ) {
            return;
          }

          await card.player.cardManager.draw(1);

          const canExhaust = singleEnemyMinionTargetRules.canPlay(game, card);
          if (!canExhaust) return;

          const targets = await singleEnemyMinionTargetRules.getPreResponseTargets(
            game,
            card,
            { type: 'card', card }
          );
          const target = targets[0];
          if (!target) return;
          await target.exhaust();
        }
      })
    );
  },
  async onPlay() {}
};
