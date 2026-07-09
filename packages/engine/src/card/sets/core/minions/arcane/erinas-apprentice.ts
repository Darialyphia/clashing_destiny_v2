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
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { RUNES } from '../../../../../player/player.enums';
import { OnScoreModifier } from '../../../../../modifier/modifiers/on-score.modifier';
import { SpellSlingerCounterModifier } from '../../../../../modifier/modifiers/counters.modifier';

export const erinasApprentice: MinionBlueprint = {
  id: 'erinasApprentice',
  name: "Erina's Apprentice",
  description: dedent /*html*/ `
    <rt-trigger>On Enter</rt-trigger> you may pay <rt-mana>2</rt-mana> to draw a spell.
    <rt-runes runes="wisdom"></rt-runes> <rt-trigger>On Score</rt-trigger> grant your Hero one stack of <rt-trigger color="green">Spellslinger</rt-trigger>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
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
          if (card.player.manaManager.mana < 2) return;
          const answer = await askMandatoryYesNoQuestion({
            game,
            card,
            questionId: 'erina-apprentice',
            label: 'Pay 2 to draw a spell ?',
            timeoutFallback: 'no',
            aiChoice: 'yes'
          });

          if (!answer) return;
          await card.player.manaManager.spend(2);
          await card.player.cardManager.drawWithFilter(1, isSpell);
        }
      })
    );

    await card.modifiers.add(
      new OnScoreModifier(game, card, {
        async handler(event, modifier) {
          await card.player.hero.modifiers.add(
            new SpellSlingerCounterModifier(game, card)
          );
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
