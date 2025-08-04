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
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const powerOverwhelming: SpellBlueprint<MinionCard> = {
  id: 'power-overwhelming',
  name: 'Power Overwhelming',
  cardIconId: 'spell-power-overwhelming',
  description: dedent`Discard any number of cards from your hand. Gain +1@[spellpower]@ this turn for each card discarded this way.`,
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.LEGENDARY,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit() {},
  async onPlay(game, card) {
    const cardsToDiscard = await game.interaction.chooseCards({
      player: card.player,
      label: 'Choose cards to discard',
      minChoiceCount: 0,
      maxChoiceCount: card.player.cardManager.hand.length,
      choices: card.player.cardManager.hand
    });

    for (const cardToDiscard of cardsToDiscard) {
      await cardToDiscard.discard();
    }

    await card.player.hero.modifiers.add(
      new SimpleSpellpowerBuffModifier('power_overwhelming_buff', game, card, {
        amount: cardsToDiscard.length,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
};
