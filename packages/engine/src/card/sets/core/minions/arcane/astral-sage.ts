import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, emptyBoardSpaceTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import type { MinionCard } from '../../../../entities/minion.entity';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { RUNES } from '../../../../../player/player.enums';

export const astralSage: MinionBlueprint = {
  id: 'astralSage',
  name: 'Astral Sage',
  description: dedent /*html*/ `
    <rt-trigger>On Enter</rt-trigger> and <rt-trigger>On Move</rt-trigger> Summon an <rt-card>Astral Ball</rt-card> in your base exhausted.
    <rt-runes runes="focus,wisdom"></rt-runes> <rt-keyword>Rush 1</rt-keyword>
    `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 5,
  runeCost: [RUNES.WISDOM],
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 5,
  commandment: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const summonAstralBall = async () => {
      const generatedCard = await card.player.generateCard<MinionCard>(
        'astralBall',
        card.isFoil
      );
      const hasRoomInBase = card.player.boardSide.base.some(space => space.isEmpty);
      if (!hasRoomInBase) return;

      const position = await emptyBoardSpaceTargetRules.getTargets({
        game,
        card,
        predicate: space =>
          space.position.zone === CARD_LOCATIONS.BASE && space.player.equals(card.player),
        canCancel: false
      });
      await generatedCard.playImmediatelyAt(position.result.spaces[0]);
      await generatedCard.exhaust();
    };

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: summonAstralBall
      })
    );

    await card.modifiers.add(
      new OnMoveModifier(game, card, { handler: summonAstralBall })
    );

    await card.modifiers.add(
      new RushModifier(game, card, {
        cost: 1,
        mixins: [new RuneCostToggleModifierMixin(game, card, { focus: 1, wisdom: 1 })]
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
