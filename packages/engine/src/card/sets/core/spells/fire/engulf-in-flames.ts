import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { battlefieldTargetRules, defaultCardArt } from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  JOBS,
  RARITIES
} from '../../../../card.enums';
import { SpellDamage } from '../../../../../utils/damage';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { JobBonusToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { askMandatoryYesNoQuestion } from '../../../../card-actions-utils';
import { RUNES } from '../../../../../player/player.enums';

export const engulfInFlames: SpellBlueprint = {
  id: 'engulfInFlames',
  name: 'Engulf in Flames',
  description: dedent /*html*/ `
  Deal 1 damage to all enemy minions at a battlefield. You may consume <rt-runes runes="wisdom,resonance"></rt-runes> to deal 2 instead.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder-spell'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  runeCost: [],
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) =>
    battlefieldTargetRules.getTargets({
      game,
      card,
      predicate: ({ space }) => space.player.equals(card.player.opponent)
    }),
  async onInit() {},
  async onPlay(game, card) {
    let damageAmount = 1;

    const canConsume = card.player.runeManager.has({ wisdom: 1, resonance: 1 });
    if (canConsume) {
      const shouldConsume = await askMandatoryYesNoQuestion({
        game,
        card,
        label:
          'consume <rt-runes runes="wisdom,resonance"></rt-runes> to increase damage?',
        questionId: 'engulf-in-flames-consume',
        aiChoice: 'yes',
        timeoutFallback: 'no'
      });
      if (shouldConsume) {
        damageAmount = 2;
        await card.player.runeManager.remove([RUNES.WISDOM, RUNES.RESONANCE]);
      }
    }

    const minionsToDamage = card.player.opponent.minions.filter(
      minion => minion.isOnBattlefield
    );

    for (const minion of minionsToDamage) {
      await minion.takeDamage(card, new SpellDamage(damageAmount, card));
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
