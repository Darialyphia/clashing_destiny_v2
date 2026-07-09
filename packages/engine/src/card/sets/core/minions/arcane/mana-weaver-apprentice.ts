import dedent from 'dedent';
import {
  RuneCostToggleModifierMixin,
  TogglableModifierMixin
} from '../../../../../modifier/mixins/togglable.mixin';
import { AttackerModifier } from '../../../../../modifier/modifiers/attacker.modifier';
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
import { StealthModifier } from '../../../../../modifier/modifiers/stealth.modifier';

export const manaWeaverApprentice: MinionBlueprint = {
  id: 'manaWeaverApprentice',
  name: 'Mana Weaver Apprentice',
  description: dedent /*html*/ `
    I have +1 Commandment if you have played 2 or more spells this turn.
    <rt-runes runes="wisdom,focus,focus"></rt-runes> <rt-keyword>Stealth</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new AttackerModifier(game, card, {
        amount: 3,
        mixins: [
          new TogglableModifierMixin(
            game,
            () =>
              card.player.cardTracker.getCardsPlayedThisTurnOfKind(CARD_KINDS.SPELL)
                .length >= 2
          )
        ]
      })
    );

    await card.modifiers.add(
      new StealthModifier(game, card, {
        mixins: [new RuneCostToggleModifierMixin(game, card, { wisdom: 1, focus: 2 })]
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
