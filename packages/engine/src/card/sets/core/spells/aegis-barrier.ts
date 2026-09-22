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
import { ShieldModifier } from '../../../../modifier/modifiers/shield.modifier';
import { InstantModifier } from '../../../../modifier/modifiers/instant.modifier';
import { AffinitiesTogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const aegisBarrier: SpellBlueprint<MinionCard> = {
  id: 'aegisBarrier',
  name: 'Aegis Barrier',
  description: dedent /*html*/ `
  Give an ally minion <rt-keyword>Shield</rt-keyword>.
  <rt-affinity affinities="${AFFINITIES.LIGHT},${AFFINITIES.LIGHT},${AFFINITIES.LIGHT},${AFFINITIES.NEUTRAL}"></rt-affinity> <rt-keyword>Instant</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/aegis-barrier'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.LIGHT],
  manaCost: 2,
  manaSupply: 2,
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
  async onInit(game, card) {
    await card.modifiers.add(
      new InstantModifier(game, card, {
        mixins: [
          new AffinitiesTogglableModifierMixin(game, [
            AFFINITIES.LIGHT,
            AFFINITIES.LIGHT,
            AFFINITIES.LIGHT,
            AFFINITIES.NEUTRAL
          ])
        ]
      })
    );
  },
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.modifiers.add(new ShieldModifier(game, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
