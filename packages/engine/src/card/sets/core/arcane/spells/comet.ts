import dedent from 'dedent';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { isMinion, multipleEnemyTargetRules } from '../../../../card-utils';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import {
  BOARD_SLOT_ZONES,
  type BoardSlotZone
} from '../../../../../board/board.constants';

export const comet: SpellBlueprint = {
  id: 'comet',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Comet',
  description: dedent`
  @Consume@ @[knowledge]@.
  Deal 4 damage to every minion in an enemy Zone.
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
  manaCost: 4,
  runeCost: {
    KNOWLEDGE: 3,
    FOCUS: 1
  },
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay: () => true,
  async getPreResponseTargets(game, card) {
    const [zone] = await game.interaction.askQuestion({
      player: card.player,
      source: card,
      label: 'Select an enemy Zone',
      minChoiceCount: 1,
      maxChoiceCount: 1,
      choices: [
        {
          id: BOARD_SLOT_ZONES.ATTACK_ZONE,
          label: 'Attack Zone'
        },
        {
          id: BOARD_SLOT_ZONES.DEFENSE_ZONE,
          label: 'Defense Zone'
        }
      ]
    });

    return card.player.opponent.boardSide.getZone(zone as BoardSlotZone).minions;
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    for (const target of targets as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(4, card));
    }
  }
};
