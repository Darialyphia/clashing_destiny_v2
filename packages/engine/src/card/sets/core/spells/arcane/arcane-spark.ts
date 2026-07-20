import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../../card-utils';
import {
  JOBS,
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SpellDamage } from '../../../../../utils/damage';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';

export const arcaneSpark: SpellBlueprint<MinionCard> = {
  id: 'arcaneSpark',
  name: 'Arcane Spark',
  description: dedent /*html*/ `
  <rt-keyword>Echo</rt-keyword>.
  Deal 1 damage to a minion. 
  <rt-runes runes="focus,wisdom"></rt-runes> This costs 1 less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) => singleMinionTargetRules.canPlay(game, card),
  getTargets: (game, card) =>
    singleMinionTargetRules.getTargets({
      game,
      card,
      aiHints: {
        shouldPick: () => 1
      },
      timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(game, card)
    }),
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('arcane-spark-discount', game, card, {
        amount: -1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            focus: 1,
            wisdom: 1
          })
        ]
      })
    );
    await card.modifiers.add(new EchoModifier(game, card, { mixins: [] }));
  },
  async onPlay(game, card, targets) {
    await targets.cards[0].takeDamage(card, new SpellDamage(1, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
