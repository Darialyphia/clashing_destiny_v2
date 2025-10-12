import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { isMinion, singleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { FleetingModifier } from '../../../../modifier/modifiers/fleeting.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';

export const temporalRecollection: SpellBlueprint = {
  id: 'temporal-recollection',
  name: 'Temporal Recollection',
  cardIconId: 'spells/temporal-recollection',
  description: dedent`
  Add @Fleeting@ copies of cards you played last turn to your hand
  @[level] 3 bonus@ : They costs @[mana] 1@ less.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.FIRE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
  },
  async onPlay(game, card) {
    const cardsPlayedLastTurn = card.player.cardTracker
      .getCardsPlayedOnGameTurn(game.turnSystem.elapsedTurns - 1)
      .filter(c => c.player.equals(card.player));

    const levelMod = card.modifiers.get(LevelBonusModifier);

    for (const playedCard of cardsPlayedLastTurn) {
      const copy = await card.player.generateCard(playedCard.card.blueprintId);
      await copy.modifiers.add(new FleetingModifier(game, copy));
      await copy.addToHand();

      if (levelMod?.isActive) {
        await copy.modifiers.add(
          new SimpleManacostModifier('temporal-recollection-discount', game, copy, {
            amount: -1
          })
        );
      }
    }
  }
};
