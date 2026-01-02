import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';

export const amplifyMagic: SpellBlueprint = {
  id: 'amplify-magic',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Amplify Magic',
  description: dedent`
    @Empower 1@.
    @[lvl] 2 Bonus@: @Empower 2@ instead.
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
      bg: 'spells/amplify-magic-bg',
      main: 'spells/amplify-magic',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 0,
  speed: CARD_SPEED.BURST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
  },
  async onPlay(game, card) {
    const levelMod = card.modifiers.get(LevelBonusModifier);
    await card.player.hero.modifiers.add(
      new EmpowerModifier(game, card, { amount: levelMod?.isActive ? 2 : 1 })
    );
  }
};
