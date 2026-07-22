import dedent from 'dedent';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { ChannelModifier } from '../../../../../modifier/modifiers/channel.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';
import { SimpleHealthBuffModifier } from '../../../../../modifier/modifiers/simple-health-buff.modifier';

export const impassibleMonk: MinionBlueprint = {
  id: 'impassibleMonk',
  name: 'Impassible Monk',
  description: dedent /*html*/ `
  <rt-keyword>Channel</rt-keyword>: gain +1 Commandment.
  <rt-runes runes="might,focus"></rt-runes> +2 Health .  
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.EARTH],
  manaCost: 3,
  runeCost: [],
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 4,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ChannelModifier(game, card, {
        async handler() {
          await card.modifiers.add(
            new SimpleCommandmentBuffModifier('impassible-monk-cmd-buff', game, card, {
              amount: 1
            })
          );
        }
      })
    );

    await card.modifiers.add(
      new SimpleHealthBuffModifier('impassible-monk-hp-buff', game, card, {
        amount: 2,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 1,
            focus: 1
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
