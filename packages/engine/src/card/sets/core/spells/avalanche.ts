import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { ReactionModifier } from '../../../../modifier/modifiers/reaction.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { FreezeModifier } from '../../../../modifier/modifiers/freeze.modifier';

export const avalanche: SpellBlueprint = {
  id: 'avalanche',
  name: 'Avalanche',
  cardIconId: 'spells/avalanche',
  description: dedent`
  @Reaction@. 
  @Freeze@ to the next minion summoned during this card chain. If that minion costs more than @[mana] 2@, draw a card into your Destiny Zone.
  `,
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
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new ReactionModifier(game, card));
  },
  async onPlay(game, card) {
    const stop = game.on(GAME_EVENTS.MINION_SUMMONED, async event => {
      await event.data.card.modifiers.add(new FreezeModifier(game, card));
      if (event.data.card.isMainDeckCard && event.data.card.manaCost > 2) {
        await card.player.cardManager.drawIntoDestinyZone(1);
      }
    });

    await game.once(GAME_EVENTS.EFFECT_CHAIN_AFTER_EFFECT_RESOLVED, stop);
  }
};
