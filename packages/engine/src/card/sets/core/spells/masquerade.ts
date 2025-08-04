import dedent from 'dedent';
import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { SpellDamage } from '../../../../utils/damage';
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
import { COMBAT_STEPS } from '../../../../game/phases/combat.phase';
import { isMinion } from '../../../card-utils';
import type { BetterExtract } from '@game/shared';

export const masquerade: SpellBlueprint<MinionCard> = {
  id: 'masquerade',
  name: 'Masquerade',
  cardIconId: 'spell-masquerade',
  description: dedent`
  Swap an allied minion that is targeted by an attack with a minion from your destiny zone that costs less.
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
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: (game, card) => {
    if (game.gamePhaseSystem.currentPlayer.equals(card.player)) return false;
    const phaseCtx = game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK) return false;

    return (
      (phaseCtx.ctx.getState() === COMBAT_STEPS.BUILDING_CHAIN ||
        phaseCtx.ctx.getState() === COMBAT_STEPS.DECLARE_TARGET) && // to enable trap activation
      [...card.player.cardManager.destinyZone].some(
        c => isMinion(c) && c.manaCost < phaseCtx.ctx.target!.manaCost
      )
    );
  },
  getPreResponseTargets: async () => [],
  async onInit(game, card) {},
  async onPlay(game, card) {
    const phaseCtx =
      game.gamePhaseSystem.getContext<BetterExtract<GamePhase, 'attack_phase'>>();

    const target = phaseCtx.ctx.target;
    if (!target || !isMinion(target)) return;

    const destinyMinions = [...card.player.cardManager.destinyZone].filter(
      c => isMinion(c) && c.manaCost < target.manaCost
    );

    const [choice] = await game.interaction.chooseCards<MinionCard>({
      player: card.player,
      label: 'Choose a minion to swap with',
      minChoiceCount: 1,
      maxChoiceCount: 1,
      choices: destinyMinions
    });

    const position = target.position!;
    target.sendToDestinyZone();
    await choice.playAt({
      player: card.player,
      ...position
    });
    phaseCtx.ctx.changeTarget(choice);
  }
};
