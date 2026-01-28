import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import type { MinionCard } from '../../../../entities/minion.entity';
import { frontlineSkirmisher } from '../minions/frontline-skirmisher';

export const dawnAssault: SpellBlueprint = {
  id: 'dawn-assault',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Dawn Assault',
  description: dedent`
    Summon 2 copies of @Frontline Skirmisher@ .
    
    @Level 3 Bonus@: Summon one more.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
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
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 3,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
  },
  async onPlay(game, card) {
    const levelMod = card.modifiers.get(LevelBonusModifier);
    const summonCount = levelMod?.isActive ? 3 : 2;

    for (let i = 0; i < summonCount; i++) {
      const skirmisher = await card.player.generateCard<MinionCard>(
        frontlineSkirmisher.id
      );
      await skirmisher.playImmediately();
    }
  }
};
