import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const spiritualist: MinionBlueprint = {
  id: 'spiritualist',
  name: 'Spiritualist',
  cardIconId: 'minions/spiritualist',
  description: dedent`
  This costs @[mana] 1@ less if you've played at least 1 spells this turn.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 3,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  setId: CARD_SETS.CORE,
  speed: CARD_SPEED.SLOW,
  job: null,
  spellSchool: null,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('spiritualist-discount', game, card, {
        amount: -1,
        mixins: [
          new TogglableModifierMixin(
            game,
            () =>
              card.player.cardTracker.getCardsPlayedThisGameTurnOfKind(CARD_KINDS.SPELL)
                .length >= 1
          )
        ]
      })
    );
  },
  async onPlay() {}
};
