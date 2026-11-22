import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, CARD_SPEED, RARITIES } from '../../../card.enums';
import { EphemeralModifier } from '../../../../modifier/modifiers/ephemeral.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { FACTION_IDS } from '../../../factions/factions';

const isValidTarget = (minion: MinionCard) => minion.isExhausted;

export const borrowedTime: SpellBlueprint<MinionCard> = {
  id: 'borrowed-time',
  name: 'Borrowed Time',
  description: dedent /*html*/ `
  Ready an exhausted ally minion and give it <rt-keyword>Ephemeral</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  manaCost: 1,
  manaSupply: 2,
  level: 2,
  exp: 1,
  factionId: FACTION_IDS.VETRUVIAN,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) => singleAllyMinionTargetRules.canPlay(game, card, isValidTarget),
  getTargets: (game, card) =>
    singleAllyMinionTargetRules.getTargets({
      game,
      card,
      label: 'Select an exhausted ally minion',
      timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(
        game,
        card,
        isValidTarget
      ),
      canCancel: true,
      predicate: isValidTarget,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.wakeUp();
    await target.modifiers.add(new EphemeralModifier(game, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
