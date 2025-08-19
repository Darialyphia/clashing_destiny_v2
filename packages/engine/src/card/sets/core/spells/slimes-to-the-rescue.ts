import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { multipleEmptyAllySlot } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import type { MinionPosition } from '../../../../game/interactions/selecting-minion-slots.interaction';
import { friendlySlime } from '../minions/friendly-slime';
import type { BetterExtract } from '@game/shared';
import type { GamePhase } from '../../../../game/game.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import { TrapModifier } from '../../../../modifier/modifiers/trap.modifier';

export const slimesToTheRescue: SpellBlueprint = {
  id: 'slimes-to-the-rescue',
  name: 'Slimes, to the Rescue!',
  cardIconId: 'spell-slime-to-the-rescue',
  description: dedent`
  Summon up to 2 @Friendly Slime@ in the Defense Zone.

  @Trap@: An enemy declares an attack on your Hero. The first summoned Slime is declared as blocker for the attack.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: multipleEmptyAllySlot.canPlay(1),
  getPreResponseTargets(game, card) {
    return multipleEmptyAllySlot.getPreResponseTargets({
      min: 1,
      max: 2,
      zone: 'defense'
    })(game, card);
  },
  async onInit(game, card) {
    await card.modifiers.add(
      new TrapModifier(game, card, {
        eventName: GAME_EVENTS.AFTER_DECLARE_ATTACK_TARGET,
        predicate: event => {
          if (!event.data.target.player.equals(card.player)) return false;
          return event.data.target.equals(card.player.hero);
        },
        async handler() {
          const phaseCtx =
            game.gamePhaseSystem.getContext<BetterExtract<GamePhase, 'attack_phase'>>();

          const targets = (await card.blueprint.getPreResponseTargets(
            game,
            card
          )) as MinionPosition[];

          await card.playWithTargets(targets);

          const firstSlime = card.player.boardSide.getSlot(
            targets[0].zone,
            targets[0].slot
          )?.minion;
          if (!firstSlime) return;

          await phaseCtx.ctx.declareBlocker(firstSlime);
        }
      })
    );
  },
  async onPlay(game, card, targets) {
    for (const target of targets as MinionPosition[]) {
      const slime = await card.player.generateCard<MinionCard>(friendlySlime.id);
      await slime.playAt(target);
    }
  }
};
