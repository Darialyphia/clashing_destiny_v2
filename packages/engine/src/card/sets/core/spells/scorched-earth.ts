import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.card';

export const scorchedEarth: SpellBlueprint<MinionCard | HeroCard> = {
  id: 'scorched-earth',
  name: 'Scorched Earth',
  cardIconId: 'scorched-earth',
  description: 'Destroy all Locations on the board.',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  subKind: SPELL_KINDS.CAST,
  canPlay: () => true,
  async getPreResponseTargets() {
    return [];
  },
  async onInit() {},
  async onPlay(game) {
    for (const player of game.playerSystem.players) {
      player.boardSide.removeLocation();
    }
  }
};
