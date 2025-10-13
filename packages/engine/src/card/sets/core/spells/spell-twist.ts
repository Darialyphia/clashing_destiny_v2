import type { SpellBlueprint } from '../../../card-blueprint';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { SpellCard } from '../../../entities/spell.entity';

export const spellTwist: SpellBlueprint = {
  id: 'spell-twist',
  name: 'Spell Twist',
  cardIconId: 'spells/spell-twist',
  description:
    'Add a copy of the last spell played by your opponent to your hand. Ignore its spell school requirements.',
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  tags: [],
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    const lastOpponentSpell = card.player.opponent.cardTracker.getLastCardPlayedByKind(
      CARD_KINDS.SPELL,
      card.player.opponent
    );
    if (!lastOpponentSpell) return;
    const copiedCard = await card.player.generateCard<SpellCard>(
      lastOpponentSpell.card.blueprintId
    );
    await copiedCard.addToHand();
  }
};
