import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { GAME_PHASES, type GamePhase } from '../../../../game/game.enums';
import { isMinion, singleAllyMinionTargetRules } from '../../../card-utils';
import { match } from 'ts-pattern';
import { SpellCard } from '../../../entities/spell.entity';
import { TrapModifier } from '../../../../modifier/modifiers/trap.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import type { BetterExtract } from '@game/shared';

export const masquerade: SpellBlueprint = {
  id: 'masquerade',
  name: 'Masquerade',
  cardIconId: 'spell-masquerade',
  description: dedent`
  Swap an allied minion with a minion from your Destiny zone that costs less.

  @Trap@ : An allied minion gets attacked. 
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: (game, card) => {
    return singleAllyMinionTargetRules.canPlay(game, card);
  },
  getPreResponseTargets(game, card) {
    return singleAllyMinionTargetRules.getPreResponseTargets(
      game,
      card,
      { type: 'card', card },
      candidate =>
        [...card.player.cardManager.destinyZone].some(
          cardInDestiny =>
            isMinion(cardInDestiny) && cardInDestiny.manaCost < candidate.manaCost
        )
    );
  },
  async onInit(game, card) {
    await card.modifiers.add(
      new TrapModifier(game, card, {
        eventName: GAME_EVENTS.AFTER_DECLARE_ATTACK_TARGET,
        predicate: event => {
          if (!event.data.target.player.equals(card.player)) return false;
          return [...card.player.cardManager.destinyZone].some(cardInDestiny => {
            return (
              isMinion(cardInDestiny) &&
              cardInDestiny.manaCost < event.data.target.manaCost
            );
          });
        },
        async handler(event) {
          const phaseCtx =
            game.gamePhaseSystem.getContext<BetterExtract<GamePhase, 'attack_phase'>>();

          await phaseCtx.ctx.declareBlocker(null);

          await card.playWithTargets([event.data.target]);
        }
      })
    );
  },
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    if (!target) return;

    const destinyMinions = [...card.player.cardManager.destinyZone].filter(
      c => isMinion(c) && c.manaCost <= target.manaCost
    );
    if (destinyMinions.length === 0) return;

    const [choice] = await game.interaction.chooseCards<MinionCard>({
      player: card.player,
      label: 'Choose a minion to swap with',
      minChoiceCount: 0,
      maxChoiceCount: 1,
      choices: destinyMinions
    });

    const position = target.position!;
    target.sendToDestinyZone();
    choice.removeFromCurrentLocation();
    await choice.playAt({
      player: card.player,
      ...position
    });

    target.targetedBy.forEach(origin => {
      match(origin)
        .with({ type: 'ability' }, origin => {
          origin.card.replaceAbilityTarget(origin.abilityId, target, choice);
        })
        .with({ type: 'card' }, origin => {
          if (origin.card instanceof SpellCard) {
            origin.card.replacePreResponseTarget(target, choice);
          }
        })
        .exhaustive();
    });

    const gamePhaseCtx = game.gamePhaseSystem.getContext();
    if (gamePhaseCtx.state !== GAME_PHASES.ATTACK) return;

    const { ctx } = gamePhaseCtx;
    if (ctx.attacker?.equals(target)) {
      ctx.changeAttacker(choice);
    }
    if (ctx.blocker?.equals(target)) {
      ctx.changeBlocker(choice);
    }
    if (ctx.target?.equals(target)) {
      ctx.changeTarget(choice);
    }
  }
};
