import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED,
  JOBS
} from '../../../../card.enums';
import { discardFromHand } from '../../../../card-actions-utils';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { UniqueModifier } from '../../../../../modifier/modifiers/unique.modifier';
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { RUNES } from '../../../../../player/player.enums';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { OverwhelmModifier } from '../../../../../modifier/modifiers/overwhelm.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const enjiOneManArmy: MinionBlueprint = {
  id: 'enjiOneManArmy',
  name: 'Enji, One-Man Army',
  description: dedent /*html*/ `
  <rt-keyword>Unique</rt-keyword> <rt-keyword>Rush 1</rt-keyword><br/>
  <rt-trigger>On Enter</rt-trigger> Consume <rt-runes runes="might,focus"></rt-runes> or destroy this minion.
  If This is the only minion you control on a battlefield, this has +2/+0/+0, and <rt-keyword>Overwhelm</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/enji-one-man-army'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 6,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  commandment: 3,
  canPlay: (game, card) => card.player.runeManager.has({ might: 1, focus: 1 }),
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          if (!card.player.runeManager.has({ might: 1, focus: 1 })) {
            await card.destroy(card);
            return;
          }
          await card.player.runeManager.remove([RUNES.MIGHT, RUNES.FOCUS]);
        }
      })
    );
    await card.modifiers.add(new UniqueModifier(game, card));
    await card.modifiers.add(new RushModifier(game, card, { cost: 1 }));
    const isAlone = () => {
      const battlefield = card.battlefield;
      if (!battlefield) return false;
      const friendlyMinions = battlefield.spaces
        .map(space => space.card)
        .filter(c => c && c.isAlly(card.player) && !c.equals(card));
      return friendlyMinions.length === 0;
    };
    await card.modifiers.add(
      new SimpleAttackBuffModifier('enji-one-man-army-atk-buff', game, card, {
        amount: 2,
        mixins: [new TogglableModifierMixin(game, isAlone)]
      })
    );
    await card.modifiers.add(
      new OverwhelmModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, isAlone)]
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
