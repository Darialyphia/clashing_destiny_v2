import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';

export const tutorialLionheartBlessing: SpellBlueprint<MinionCard> = {
  id: 'tutorial-lionheart-blessing',
  name: 'Lionheart Blessing',
  description: dedent /*html*/ `
  Give an ally minion +2 Influence.
  `,
  collectable: false,
  setId: CARD_SETS.TUTORIAL,
  art: defaultCardArt('spells/lionheart-blessing'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.TOKEN,
  affinities: [AFFINITIES.LIGHT],
  manaCost: 1,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: (game, card) => singleAllyMinionTargetRules.canPlay(game, card),
  getTargets: (game, card) =>
    singleAllyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.modifiers.add(
      new SimpleStatsBuffModifier('tutorial-lionheart-blessing', game, card, {
        atk: 0,
        cmd: 2,
        hp: 0
      })
    );
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
