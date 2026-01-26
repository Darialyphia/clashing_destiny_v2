import dedent from 'dedent';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import type { SpellCard } from '../../../../entities/spell.entity';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const comet: SpellBlueprint = {
  id: 'comet',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Comet',
  description: dedent`
  Deal 4 damage to all enemy minions.
  @[lvl] 3@: This costs @[mana] 2@ less.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
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
  manaCost: 6,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay: () => true,
  async getPreResponseTargets() {
    return Promise.resolve([]);
  },
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<SpellCard>;
    await card.modifiers.add(
      new SimpleManacostModifier('comet-cost-discount', game, card, {
        amount: -2,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );
  },
  async onPlay(game, card) {
    for (const target of card.player.enemyMinions as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(4, card));
    }
  }
};
