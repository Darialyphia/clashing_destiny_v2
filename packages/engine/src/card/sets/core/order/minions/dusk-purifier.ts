import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import type { MinionCard } from '../../../../entities/minion.entity';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { LingeringDestinyModifier } from '../../../../../modifier/modifiers/lingering-destiny.modifier';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';

export const duskPurifier: MinionBlueprint = {
  id: 'dusk-purifier',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Dusk Purifier',
  description: dedent`
    When this survives damage, draw a card.
    @Lingering Destiny@
  `,
  faction: FACTIONS.ORDER,
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
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 3,
  maxHp: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new LingeringDestinyModifier(game, card));

    await card.modifiers.add(
      new Modifier<MinionCard>('dusk-purifier-on-damage', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
            handler: async event => {
              if (!event.data.card.equals(card)) return;
              if (!event.data.isFatal && card.isAlive) {
                await card.player.cardManager.draw(1);
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
