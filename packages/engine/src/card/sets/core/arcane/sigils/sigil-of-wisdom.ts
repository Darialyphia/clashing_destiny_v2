import type { SigilBlueprint } from '../../../../card-blueprint';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { SigilCard } from '../../../../entities/sigil.entity';
import dedent from 'dedent';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { isSpell } from '../../../../card-utils';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { CardEffectTriggeredEvent } from '../../../../card.events';

export const sigilOfWisdom: SigilBlueprint = {
  id: 'sigil-of-wisdom',
  kind: CARD_KINDS.SIGIL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Sigil of Wisdom',
  description: dedent`
  The first time you play an Arcane Spell each turn, draw a card into your Destiny Zone.
  @On Destroyed@: Draw a card.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
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
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 3,
  abilities: [],
  maxCountdown: 3,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<SigilCard>('sigil-of-wisdom-spellWatch', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
            frequencyPerGameTurn: 1,
            filter: event => {
              return (
                event.data.card.player.equals(card.player) &&
                event.data.card.faction === FACTIONS.ARCANE &&
                isSpell(event.data.card)
              );
            },
            handler: async () => {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Sigil of Wisdom triggered'
                })
              );
              await card.player.cardManager.drawIntoDestinyZone(1);
            }
          })
        ]
      })
    );

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {
          await card.player.cardManager.draw(1);
        }
      })
    );
  },
  async onPlay() {}
};
