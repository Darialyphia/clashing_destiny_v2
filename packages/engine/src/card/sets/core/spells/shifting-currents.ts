import type { BetterExtract } from '@game/shared';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import type { GamePhase } from '../../../../game/game.enums';

export const shiftingCurrents: SpellBlueprint = {
  id: 'shifting-currents',
  name: 'Shifting Currents',
  cardIconId: 'spells/shifting-currents',
  description:
    'Target an attacking enemy minion. Deal 1 damage to it and cancel the attack.',
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.WATER,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  abilities: [],
  tags: [],
  canPlay(game, card) {
    return singleEnemyTargetRules.canPlay(game, card, candidate => candidate.isAttacking);
  },
  getPreResponseTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(
      game,
      card,
      {
        type: 'card',
        card
      },
      candidate => candidate.isAttacking
    );
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    await target.takeDamage(card, new SpellDamage(1, card));
    const phaseCtx =
      game.gamePhaseSystem.getContext<BetterExtract<GamePhase, 'attack_phase'>>();
    await phaseCtx.ctx.cancelAttack();
  }
};
