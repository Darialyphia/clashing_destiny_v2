import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const magicChanneler: MinionBlueprint = {
  id: 'magicChanneler',
  name: 'Magic Channeler',
  cardIconId: 'magic-channeler',
  description: `Your hero has +1 Spellpower.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 2,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    const buff = new SimpleSpellpowerBuffModifier('magic_channeler_buff', game, card, {
      amount: 1
    });

    await card.modifiers.add(
      new WhileOnBoardModifier('magicChanneler', game, card, {
        async onActivate() {
          await card.player.hero.modifiers.add(buff);
        },
        async onDeactivate() {
          await card.player.hero.modifiers.remove(buff);
        }
      })
    );
  },
  async onPlay() {}
};
