import type { BoardPosition } from '../../../../game/interactions/selecting-minion-slots.interaction';
import { FreezeModifier } from '../../../../modifier/modifiers/freeze.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  singleEmptyAllySlot,
  singleEmptySlot,
  singleEnemyTargetRules
} from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const frostNova: SpellBlueprint = {
  id: 'frost-nova',
  name: 'Frost Nova',
  cardIconId: 'spells/frost-nova',
  description: 'Target an empty space. @Freeze@ all minion adjacent to that space.',
  collectable: true,
  unique: false,
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.WATER,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  abilities: [],
  tags: [],
  canPlay: singleEmptySlot.canPlay,
  getPreResponseTargets(game, card) {
    return singleEmptySlot.getPreResponseTargets(game, card);
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as BoardPosition;

    const adjacentMinions = game.boardSystem.getSlot(target)?.adjacentMinions ?? [];
    for (const minion of adjacentMinions) {
      await minion.modifiers.add(new FreezeModifier<MinionCard>(game, card));
    }
  }
};
