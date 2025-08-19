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
import { playfulEels } from '../minions/playful-eels';

export const shoalOfEels: SpellBlueprint = {
  id: 'shoal-of-eels',
  name: 'Shoal of Eels',
  cardIconId: 'spell-shoal-of-eels',
  description: dedent`
  Summon up to 2 @Playful Eels@.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  affinity: AFFINITIES.WATER,
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
      max: 2
    })(game, card);
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    for (const target of targets as MinionPosition[]) {
      const eel = await card.player.generateCard<MinionCard>(playfulEels.id);
      await eel.playAt(target);
    }
  }
};
