import dedent from 'dedent';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../../card-utils';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { SpellboostModifier } from '../../../../../modifier/modifiers/spellboost.modifier';
import type { SpellCard } from '../../../../entities/spell.entity';

export const galacticExplosion: SpellBlueprint = {
  id: 'galactic-explosion',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Galactic Explosion',
  description: dedent`
  @Spellboost@: this costs @[mana] 1@ less.

  Deal 10 damage to a unit.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 10,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay(game, card) {
    return singleEnemyTargetRules.canPlay(game, card);
  },
  getPreResponseTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit(game, card) {
    const spellboostMod = (await card.modifiers.add(
      new SpellboostModifier(game, card, {})
    )) as SpellboostModifier<SpellCard>;

    await card.modifiers.add(
      new SimpleManacostModifier('galactic-explosion-manacost-modifier', game, card, {
        amount: () => -1 * spellboostMod.spellBoostStacks
      })
    );
  },
  async onPlay(game, card, targets) {
    for (const target of targets as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(10, card));
    }
  }
};
