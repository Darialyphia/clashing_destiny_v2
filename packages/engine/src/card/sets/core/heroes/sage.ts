import { GAME_EVENTS } from '../../../../game/game.events';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
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
  description:
    'As long as this has at least 4+ @[spellpower]@, after you play a spell, draw a card.',
  kind: CARD_KINDS.HERO,
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
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('sage-buff', game, card, {
        icon: 'modifier-double-cast',
        name: 'One with the magic',
        description: 'After you play a spell, draw a card.',
        mixins: [
          new TogglableModifierMixin(game, () => card.player.hero.spellPower >= 3),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            handler: async event => {
              const { card: playedCard } = event.data;
              if (
                playedCard.kind === CARD_KINDS.SPELL &&
                playedCard.player.equals(card.player)
              ) {
                await card.player.cardManager.draw(1);
              }
            }
          })
        ]
      })
    );
  }
};
