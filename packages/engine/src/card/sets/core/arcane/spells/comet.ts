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
  manaCost: 5,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay: () => true,
  async getPreResponseTargets() {
    return Promise.resolve([]);
  },
  async onInit() {},
  async onPlay(game, card) {
    for (const target of card.player.enemyMinions as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(4, card));
    }
  }
};
