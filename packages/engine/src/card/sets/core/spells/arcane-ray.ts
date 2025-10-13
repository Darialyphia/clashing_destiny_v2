import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anyMinionSlot } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { BoardPosition } from '../../../../game/interactions/selecting-minion-slots.interaction';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';

export const arcaneRay: SpellBlueprint = {
  id: 'arcane-ray',
  name: 'Arcane Ray',
  cardIconId: 'spells/arcane-ray',
  description: dedent`
  Deal 2 damage to all enemies in a row.
  @[level] 3 bonus@: this also damages the enemy Hero.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  abilities: [],
  canPlay: anyMinionSlot.canPlay,
  getPreResponseTargets(game, card) {
    return anyMinionSlot.getPreResponseTargets({ min: 1, max: 1, allowRepeat: false })(
      game,
      card
    );
  },
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
  },
  async onPlay(game, card, targets) {
    const target = targets[0] as BoardPosition;

    const levelMod = card.modifiers.get(LevelBonusModifier);

    const minions = game.boardSystem
      .getColumn(target.slot)
      .minions.filter(m => m.isEnemy(card));

    for (const minion of minions) {
      await minion.takeDamage(card, new SpellDamage(2));
    }

    if (levelMod?.isActive) {
      await card.player.opponent.hero.takeDamage(card, new SpellDamage(2));
    }
  }
};
