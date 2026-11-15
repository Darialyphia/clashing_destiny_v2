import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, CARD_SPEED, RARITIES } from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { ShieldModifier } from '../../../../modifier/modifiers/shield.modifier';
import { FACTION_IDS } from '../../../factions/factions';

export const aegisBarrier: SpellBlueprint<MinionCard> = {
  id: 'aegisBarrier',
  name: 'Aegis Barrier',
  description: dedent /*html*/ `
  Give an ally minion <rt-keyword>Shield</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/aegis-barrier'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  manaCost: 2,
  manaSupply: 2,
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

    await target.modifiers.add(new ShieldModifier(game, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
