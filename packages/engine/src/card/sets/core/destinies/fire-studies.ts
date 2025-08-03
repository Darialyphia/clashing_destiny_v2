import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { DestinyBlueprint } from '../../../card-blueprint';
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
  description: 'When you play a Fire Spell, your hero gains 1 sack of @Ember@.',
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
  abilities: [
    {
      id: 'fire-studies-ability',
      manaCost: 0,
      shouldExhaust: false,
      description:
        '@[mana] 0@ : Consume 3 stacks of @Ember@ from your hero to draw a card and deal 2 damage to your hero.',
      label: 'Consume 3 Embers: draw a card',
      getPreResponseTargets: async () => [],
      canUse: (game, card) => {
        const hero = card.player.hero;
        if (!hero.modifiers.has(EmberModifier)) return false;
        return hero.modifiers.get(EmberModifier)!.stacks >= 3;
      },
      onResolve: async (game, card) => {
        const hero = card.player.hero;
        const emberModifier = hero.modifiers.get(EmberModifier);
        if (!emberModifier) return;
        await emberModifier.removeStacks(3);
        await card.player.cardManager.draw(1);
        await card.player.hero.takeDamage(card, new AbilityDamage(2));
      }
    }
  ],
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('fire-studies-embers-on-spell-cast', game, card, {
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
  }
};
