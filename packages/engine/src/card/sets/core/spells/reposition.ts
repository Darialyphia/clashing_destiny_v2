import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleAllyMinionTargetRules, singleEmptyAllySlot } from '../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  HERO_JOBS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const reposition: SpellBlueprint = {
  id: 'reposition',
  name: 'Reposition',
  cardIconId: 'spells/reposition',
  description:
    'Move an ally minion that is not targeted by an attack to an adjacent position',
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.FLASH,
  spellSchool: null,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: (game, card) =>
    singleAllyMinionTargetRules.canPlay(game, card, c => {
      return !c.isAttackTarget;
    }),
  getPreResponseTargets: (game, card) =>
    singleAllyMinionTargetRules.getPreResponseTargets(game, card, { type: 'card', card }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    if (!target) return;

    if (!singleEmptyAllySlot.canPlay(game, card)) return;

    const [slot] = await game.interaction.selectMinionSlot({
      player: card.player,
      canCommit(selectedSlots) {
        return selectedSlots.length === 1;
      },
      isDone(selectedSlots) {
        return selectedSlots.length === 1;
      },
      isElligible(position) {
        const adjacentPositions = target.slot!.adjacentSlots.filter(
          slot => slot.player.equals(card.player) && !slot.isOccupied
        );
        return adjacentPositions.some(
          slot => slot.zone === position.zone && slot.slot === position.slot
        );
      }
    });

    if (!slot) return;

    await target.moveTo(slot);
  }
};
