import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { CardInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';

export const solemnDecree: SpellBlueprint = {
  id: 'solemn-decree',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Solemn Decree',
  description: dedent`
   Discard a card. this turn, your opponent cannot play cards with the same mana cost as the discarded card.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.RARE,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  destinyCost: 0,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    if (card.player.cardManager.hand.length === 0) return;

    const [cardToDiscard] = await game.interaction.chooseCards({
      player: card.player,
      label: 'Choose a card to discard',
      minChoiceCount: 1,
      maxChoiceCount: 1,
      choices: card.player.cardManager.hand
    });

    await cardToDiscard.discard();

    const cost = cardToDiscard.manaCost;
    await card.player.modifiers.add(
      new Modifier('solemn-decree', game, card, {
        mixins: [
          new AuraModifierMixin(game, card, {
            isElligible(candidate) {
              return (
                candidate.isEnemy(card) &&
                candidate.location === CARD_LOCATIONS.HAND &&
                candidate.manaCost === cost
              );
            },
            getModifiers(candidate) {
              return [
                new Modifier('solemn-decree-aura', game, card, {
                  mixins: [
                    new CardInterceptorModifierMixin(game, {
                      // @ts-expect-error
                      key: 'canPlay',
                      interceptor: () => false
                    })
                  ]
                })
              ];
            }
          }),
          new UntilEndOfTurnModifierMixin(game)
        ]
      })
    );
  }
};
