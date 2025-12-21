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

export const splittingBeam: SpellBlueprint = {
  id: 'splitting-beam',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Splitting Beam',
  description: dedent`
    Deal 1 damage to 2 enemies.
`,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
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
  manaCost: 2,
  runeCost: {
    KNOWLEDGE: 2
  },
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay(game, card) {
    return multipleEnemyTargetRules.canPlay(2)(game, card);
  },
  getPreResponseTargets(game, card) {
    return multipleEnemyTargetRules.getPreResponseTargets({
      min: 2,
      max: 2,
      allowRepeat: false
    })(
      game,
      card,
      {
        type: 'card',
        card
      },
      c => isMinion(c)
    );
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    for (const target of targets as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(1, card));
    }
  }
};
