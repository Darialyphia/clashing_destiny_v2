import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { UntilEventModifierMixin } from '../../../../../modifier/mixins/until-event';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { empower } from '../../../../card-actions-utils';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { isSpell } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { CardBeforePlayEvent } from '../../../../card.events';
import type { HeroCard } from '../../../../entities/hero.entity';

export const erinaLv3: HeroBlueprint = {
  id: 'erina-arcane-weaver',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Erina, Arcane Weaver',
  description: 'This has +1 Attack as long as you played a spell this turn.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: false,
        oil: false,
        gradient: true,
        lightGradient: true,
        scanlines: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'heroes/erina-lv3-bg',
      main: 'heroes/erina-lv3',
      breakout: 'heroes/erina-lv3-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 3,
  runeCost: {},
  level: 3,
  lineage: 'erina',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 21,
  canPlay: () => true,
  abilities: [
    {
      id: 'erina-lv3-ability-1',
      canUse: (game, card) => card.location === CARD_LOCATIONS.BOARD,
      shouldExhaust: true,
      manaCost: 2,
      runeCost: {},
      description: 'Draw a spell, then discard 1 card.',
      getPreResponseTargets: () => Promise.resolve([]),
      label: 'Draw a spell and discard',
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        await card.player.cardManager.drawWithFilter(1, isSpell);
        const [cardToDiscard] = await game.interaction.chooseCards({
          player: card.player,
          label: 'Choose a card to discard',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          choices: card.player.cardManager.hand
        });
        await cardToDiscard.discard();
      }
    },
    {
      id: 'erina-lv3-ability-2',
      canUse: () => true,
      shouldExhaust: true,
      manaCost: 0,
      runeCost: {},
      description: '@Empower 2@. The next spell you play this turn has @Echo@',
      getPreResponseTargets: () => Promise.resolve([]),
      label: 'Improve next spell',
      speed: CARD_SPEED.BURST,
      async onResolve(game, card) {
        await card.modifiers.add(
          new Modifier<HeroCard>('erina-lv3-improve-next-spell', game, card, {
            mixins: [
              new GameEventModifierMixin(game, {
                eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
                filter: event =>
                  event.data.card.player.equals(card.player) && isSpell(event.data.card),
                async handler(event: CardBeforePlayEvent) {
                  empower(game, card, 2);
                  await event.data.card.modifiers.add(new EchoModifier(game, card));
                }
              }),
              new UntilEventModifierMixin(game, {
                eventName: GAME_EVENTS.CARD_AFTER_PLAY,
                filter: event =>
                  event.data.card.player.equals(card.player) && isSpell(event.data.card)
              })
            ]
          })
        );
      }
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleAttackBuffModifier('erina-lv2-attack-buff', game, card, {
        amount: 1,
        mixins: [
          new TogglableModifierMixin(
            game,
            () =>
              card.player.cardTracker.getCardsPlayedThisGameTurnOfKind(CARD_KINDS.SPELL)
                .length > 0
          )
        ]
      })
    );
  },
  async onPlay() {}
};
