import { BurnModifier } from '../../../../../modifier/modifiers/burn.modifier';
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

export const fireElemental: MinionBlueprint = {
  id: 'fire-elemental',
  name: 'Fire Elemental',
  description:
    '<rt-trigger>On Minion Attack</rt-trigger>: <rt-keyword>Burn (1)</rt-keyword> the attack target.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.FLYER,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL.id],
  manaCost: 3,
  tags: [TAGS.FIRE, TAGS.ELEMENTAL],
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
          await event.data.target.modifiers.add(
            new BurnModifier(game, card, { stacks: 1 })
          );
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
