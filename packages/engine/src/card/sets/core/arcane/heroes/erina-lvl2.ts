import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { isSpell } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { HeroCard } from '../../../../entities/hero.entity';

export const erinaLv2: HeroBlueprint = {
  id: 'erina-aether-scholar',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Erina, Aether Scholar',
  description:
    'The first time you play a Spell each turn while @Empowered@, draw a card.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
  tags: [],
  art: {
    default: {
      foil: {
        oil: true,
        lightGradient: true
      },
      dimensions: {
        width: 174,
        height: 140
      },
      bg: 'heroes/erina-lv2-bg',
      main: 'heroes/erina-lv2',
      breakout: 'heroes/erina-lv2-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 2,
  level: 2,
  lineage: 'erina',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 18,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<HeroCard>('erina-lv2-draw-spell-watch', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            frequencyPerGameTurn: 1,
            filter(event) {
              return (
                event.data.card.player.equals(card.player) &&
                isSpell(event.data.card) &&
                card.player.hero.modifiers.has(EmpowerModifier)
              );
            },
            async handler() {
              await card.player.cardManager.draw(1);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
