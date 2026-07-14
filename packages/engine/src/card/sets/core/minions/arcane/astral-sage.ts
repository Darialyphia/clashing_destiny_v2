import dedent from 'dedent';
import {
  RuneCostToggleModifierMixin,
  TogglableModifierMixin
} from '../../../../../modifier/mixins/togglable.mixin';
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
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import type { MinionCard } from '../../../../entities/minion.entity';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { InstantAttackModifier } from '../../../../../modifier/modifiers/instant-attack.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';

export const astralSage: MinionBlueprint = {
  id: 'astralSage',
  name: 'Astral Sage',
  description: dedent /*html*/ `
    <rt-trigger>On Enter</rt-trigger> and <rt-trigger>On Move</rt-trigger> Summon an <rt-card>Astral Ball</rt-card> in your base exhausted.
    <br />
    <rt-location locations="battlefield">This gains CMD equal to amount of <rt-card>Astral Ball</rt-card> you control on the same battlefield.</rt-location>
    `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 6,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 6,
  commandment: 1,
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
        predicate: space => space.position.zone === CARD_LOCATIONS.BASE,
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
      new SimpleManacostModifier('astralSage', game, card, {
        amount: -1,
        mixins: [new RuneCostToggleModifierMixin(game, card, { wisdom: 1, focus: 2 })]
      })
    );

    const astralBallThresholdMixin = () =>
      new TogglableModifierMixin(
        game,
        () =>
          card.player.minions.filter(minion => minion.blueprint.id === 'astralBall')
            .length >= 3
      );
    await card.modifiers.add(
      new InstantAttackModifier(game, card, {
        mixins: [astralBallThresholdMixin()]
      })
    );

    await card.modifiers.add(
      new SimpleAttackBuffModifier<MinionCard>('astralSage-atk-buff', game, card, {
        amount: 1,
        mixins: [astralBallThresholdMixin()]
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
