import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import type {
  Ability,
  DestinyBlueprint,
  PreResponseTarget
} from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';

export const fireStudies: DestinyBlueprint = {
  id: 'fire-studies',
  name: 'Fire Studies',
  cardIconId: 'talent-fire-studies',
  description:
    'When you play a Fire Spell, gain 1 sack of Embers.\n@[mana] 0@ : Consume 3 stacks of Embers to draw a card.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  tags: [],
  minLevel: 1,
  async onInit() {},
  async onPlay(game, card) {
    const ability: Ability<HeroCard, PreResponseTarget> = {
      id: 'fire-studies-ability',
      manaCost: 0,
      shouldExhaust: false,
      description: 'Consume 3 stacks of Embers to draw a card.',
      label: 'Consume 3 Embers: draw a card',
      getPreResponseTargets: async () => [],
      canUse: (game, card) => {
        const hero = card.player.hero;
        if (!hero.modifiers.has(EmberModifier)) return false;
        return hero.modifiers.get(EmberModifier)!.stacks >= 3;
      },
      onResolve: async () => {
        const hero = card.player.hero;
        const emberModifier = hero.modifiers.get(EmberModifier);
        if (!emberModifier) return;
        await emberModifier.removeStacks(3);
        await card.player.cardManager.draw(1);
      }
    };

    await card.player.hero.modifiers.add(
      new Modifier('fire-studies-embers-on-spell-cast', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            handler: async event => {
              if (!event.data.card.player.equals(card.player)) return;
              if (event.data.card.kind !== CARD_KINDS.SPELL) return;
              if (event.data.card.affinity !== AFFINITIES.FIRE) return;
              await card.player.hero.modifiers.add(new EmberModifier(game, card));
            }
          })
        ]
      })
    );

    await card.player.hero.modifiers.add(
      new Modifier('fire-studies-ability', game, card, {
        mixins: [
          new HeroInterceptorModifierMixin(game, {
            key: 'abilities',
            interceptor(value) {
              return [...value, ability];
            }
          })
        ]
      })
    );
  }
};
