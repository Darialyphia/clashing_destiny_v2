import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  anywhereTargetRules,
  defaultCardArt,
  emptyBoardSpaceTargetRules
} from '../../../../card-utils';
import {
  JOBS,
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { RUNES } from '../../../../../player/player.enums';

export const starConvergence: SpellBlueprint = {
  id: 'starconvergence',
  name: 'Star Convergence',
  description: dedent /*html*/ `
  Summon 2 <rt-card>Astral Ball</rt-card> exhausted.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder-spell'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  runeCost: [RUNES.RESONANCE],
  speed: CARD_SPEED.SLOW,
  tags: [],
  shouldHideTargetarrows: true,
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    const summonBall = async () => {
      const generatedCard = await card.player.generateCard<MinionCard>(
        'astralBall',
        card.isFoil
      );

      const hasRoom = game.boardSystem.boardSpaces.some(
        space => space.player.equals(card.player) && space.isEmpty
      );
      if (!hasRoom) return;

      const position = await emptyBoardSpaceTargetRules.getTargets({
        game,
        card,
        predicate: space => space.player.equals(card.player),
        canCancel: false
      });
      await generatedCard.playImmediatelyAt(position.result.spaces[0]);
      await generatedCard.exhaust();
    };

    await summonBall();
    await summonBall();
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
