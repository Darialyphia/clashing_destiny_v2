import { LockedeModifier } from '../../../../modifier/modifiers/locked.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const hourglassFracture: SpellBlueprint = {
  id: 'hourglass-fracture',
  name: 'Hourglass Fracture',
  cardIconId: 'spells/hourglass-fracture',
  description: "@[level] 3 bonus@ : @Lock@ all cards in the opponent's Destiny Zone.",
  collectable: true,
  unique: false,
  destinyCost: 4,
  speed: CARD_SPEED.SLOW,
  spellSchool: null,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.LEGENDARY,
  abilities: [],
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    for (const opponentCard of Array.from(card.player.opponent.cardManager.destinyZone)) {
      await opponentCard.modifiers.add(
        new LockedeModifier(game, card, {
          duration: 2
        })
      );
    }
  }
};
