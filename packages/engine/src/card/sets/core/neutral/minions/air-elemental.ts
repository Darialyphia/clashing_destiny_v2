import dedent from 'dedent';
import { FreezeModifier } from '../../../../../modifier/modifiers/freeze.modifier';
import { MinionOnAttackModifier } from '../../../../../modifier/on-attack.modifier';
import { Player } from '../../../../../player/player.entity';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES,
  TAGS
} from '../../../../card.enums';
import { CelerityCardModifier } from '../../../../../modifier/modifiers/celerity.modifier';
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';

export const airElemental: MinionBlueprint = {
  id: 'air-elemental',
  name: 'Air Elemental',
  description: dedent`, <rt-keyword>Celerity</rt-keyword>, <rt-keyword>Rush</rt-keyword>`,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.MELEE,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL.id],
  manaCost: 3,
  tags: [TAGS.AIR, TAGS.ELEMENTAL],
  atk: 2,
  retaliation: 2,
  maxHp: 5,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new CelerityCardModifier(game, card));
    await card.modifiers.add(new RushModifier(game, card));
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
