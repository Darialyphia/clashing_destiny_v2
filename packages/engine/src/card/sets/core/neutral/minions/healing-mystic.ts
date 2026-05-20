import dedent from 'dedent';
import { type MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { JobBonusModifier } from '../../../../../modifier/modifiers/job-bonus.modifier';
import { ChannelModifier } from '../../../../../modifier/modifiers/channel.modifier';
import { MinionCard } from '../../../../entities/minion.entity';

export const healingMystic: MinionBlueprint = {
  id: 'healing_mystic',
  name: 'Healing Mystic',
  description: dedent /*html*/ `
    <rt-trigger>Channel</rt-trigger> Heal nearby ally minions for 2.
    <rt-lvl-bonus lvl="2"><rt-job-bonus job="acolyte">This costs 1 less.</rt-job-bonus></rt-lvl-bonus> 
    `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  subKind: MINION_TYPES.MELEE,
  tags: [],
  atk: 1,
  maxHp: 3,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;
    await card.modifiers.add(new JobBonusModifier(game, card, JOBS.ACOLYTE.id));
    const jobMod = card.modifiers.get(JobBonusModifier)!;

    await card.modifiers.add(
      new SimpleManacostModifier('healing-mystic-discount', game, card, {
        amount: -2,
        mixins: [
          new TogglableModifierMixin(game, () => lvlMod.isActive && jobMod.isActive)
        ]
      })
    );

    await card.modifiers.add(
      new ChannelModifier(game, card, {
        handler: async () => {
          const adjacentAllies = card.position
            .getAdjacentCardsOfKind<MinionCard>(CARD_KINDS.MINION)
            .filter(minion => minion.isAlly(card));
          for (const ally of adjacentAllies) {
            await ally.heal(2);
          }
        }
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 0,
    shouldMove: () => 0,
    shouldAttack: () => 0,
    getThreatScore: () => 0
  }
};
