import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isSpell } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { askMandatoryYesNoQuestion } from '../../../../card-actions-utils';
import { SpellSlingerCounterModifier } from '../../../../../modifier/modifiers/counters.modifier';

export const erinasApprentice: MinionBlueprint = {
  id: 'erinasApprentice',
  name: "Erina's Apprentice",
  description: dedent /*html*/ `
    <rt-trigger>On Enter</rt-trigger> you may remove 2 stacks of <rt-trigger color="green">SpellSlinger</rt-trigger> from your Hero to draw a spell.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 2,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const spellslingerMod = card.player.hero.modifiers.get(
            SpellSlingerCounterModifier
          );
          if (!spellslingerMod || spellslingerMod.stacks < 2) return;
          const answer = await askMandatoryYesNoQuestion({
            game,
            card,
            questionId: 'erina-apprentice',
            label: 'Remove 2 stacks of SpellSlinger to draw a spell?',
            timeoutFallback: 'no',
            aiChoice: 'yes'
          });

          if (!answer) return;
          await spellslingerMod.removeStacks(2);
          await card.player.cardManager.drawWithFilter(1, isSpell);
        }
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
