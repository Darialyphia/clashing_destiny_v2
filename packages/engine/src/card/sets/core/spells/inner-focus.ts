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
import { AffinitiesTogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { InstantModifier } from '../../../../modifier/modifiers/instant.modifier';

export const innerFocus: SpellBlueprint<MinionCard> = {
  id: 'innerFocus',
  name: 'Inner Focus',
  description: dedent /*html*/ `
  Wake up an ally minion.
  <rt-affinity affinities="${AFFINITIES.FIRE},${AFFINITIES.FIRE},${AFFINITIES.FIRE},${AFFINITIES.NEUTRAL}"></rt-affinity> <rt-keyword>Instant</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/inner_focus'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE],
  manaCost: 2,
  manaSupply: 3,
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
            AFFINITIES.FIRE,
            AFFINITIES.FIRE,
            AFFINITIES.FIRE,
            AFFINITIES.NEUTRAL
          ])
        ]
      })
    );
  },
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.wakeUp();
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
