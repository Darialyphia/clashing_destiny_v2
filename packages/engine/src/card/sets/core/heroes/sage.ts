import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { HeroCard } from '../../../entities/hero.entity';

export const sage: HeroBlueprint = {
  id: 'sage',
  name: 'Sage',
  cardIconId: 'hero-sage',
  description: 'After you play 3 spells in a single turn, draw a card.',
  kind: CARD_KINDS.HERO,
  level: 1,
  destinyCost: 0,
  affinity: AFFINITIES.NORMAL,
  affinities: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 20,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<HeroCard>('sage-spell-draw', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            handler: async event => {
              if (!event.data.card.player.equals(card.player)) return;
              if (event.data.card.kind !== CARD_KINDS.SPELL) return;
              await game.inputSystem.schedule(async () => {
                const count = card.player.cardTracker.getCardsPlayedThisGameTurnOfKind(
                  CARD_KINDS.SPELL
                ).length;
                if (count === 3) {
                  await card.player.cardManager.draw(1);
                }
              });
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
