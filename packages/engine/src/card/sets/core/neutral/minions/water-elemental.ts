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

export const waterElemental: MinionBlueprint = {
  id: 'water-elemental',
  name: 'Water Elemental',
  description: dedent`
    <rt-trigger>On Minion Attack</rt-trigger>: <rt-keyword>Freeze (1)</rt-keyword> the attack target if it is exhausted.`,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.FLYER,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL.id],
  manaCost: 3,
  tags: [TAGS.WATER, TAGS.ELEMENTAL],
  atk: 2,
  retaliation: 2,
  maxHp: 5,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnAttackModifier(game, card, {
        async handler(event) {
          if (event.data.target instanceof Player) return;
          await event.data.target.modifiers.add(new FreezeModifier(game, card));
        }
      })
    );
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
