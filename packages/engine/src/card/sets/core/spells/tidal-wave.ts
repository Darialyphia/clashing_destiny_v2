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
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.entity';

export const tidalWave: SpellBlueprint = {
  id: 'tidal-wave',
  name: 'Tidal Wave',
  cardIconId: 'spell-tidal-wave',
  description: `Move all enemy minions in the Attack one to the Defense zone. If the space is occupied, both minions take 2 damage instead.`,
  collectable: true,
  unique: false,
  manaCost: 5,
  affinity: AFFINITIES.WATER,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit() {},
  async onPlay(game, card) {
    for (const enemy of card.player.opponent.boardSide.attackZone.minions) {
      const targetSpace = enemy.player.boardSide.defenseZone.get(enemy.position!.slot);
      if (targetSpace.isOccupied) {
        await enemy.takeDamage(card, new SpellDamage(2));
        await targetSpace.minion!.takeDamage(card, new SpellDamage(2));
      } else {
        await enemy.player.boardSide.moveMinion(enemy.position!, {
          zone: 'defense',
          slot: enemy.position!.slot
        });
      }
    }
  }
};
