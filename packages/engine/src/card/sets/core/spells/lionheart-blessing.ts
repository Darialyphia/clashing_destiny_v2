import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, CARD_SPEED, RARITIES } from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { VigilantModifier } from '../../../../modifier/modifiers/vigilant.modifier';
import { FACTION_IDS } from '../../../factions/factions';

export const lionheartBlessing: SpellBlueprint<MinionCard> = {
  id: 'lionheartBlessing',
  name: 'Lionheart Blessing',
  description: dedent /*html*/ `
  Give an ally minion <rt-keyword>Zeal 2</rt-keyword><rt-trigger>On Attack</rt-trigger>: Draw a card.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/lionheart-blessing'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  manaCost: 1,
  manaSupply: 3,
  level: 1,
  exp: 1,
  factionId: FACTION_IDS.LYONAR,
  speed: CARD_SPEED.FAST,
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
      new SimpleStatsBuffModifier('steadfast-vigil', game, card, {
        atk: 0,
        cmd: 0,
        hp: 1
      })
    );

    await target.modifiers.add(new VigilantModifier(game, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
