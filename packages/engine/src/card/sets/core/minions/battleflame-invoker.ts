import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.entity';

export const battleflameInvoker: MinionBlueprint = {
  id: 'battleflame-invoker',
  name: 'Battleflame Invoker',
  cardIconId: 'unit-battleflame-invoker',
  description: `As long as your hero has at least 4 stacks of @Ember@, they gain +2 @[spellpower]@`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 2,
  maxHp: 4,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [
    {
      id: 'battleflame-invoker-ability',
      description: '@[exhaust]@ :  add 1 stack of @Ember@ to your hero',
      label: 'Gain 1 Ember',
      shouldExhaust: true,
      manaCost: 0,
      canUse: (game, card) => card.location === 'board',
      getPreResponseTargets: async () => [],
      async onResolve(game, card) {
        await card.player.hero.modifiers.add(new EmberModifier(game, card));
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const buff = new SimpleSpellpowerBuffModifier(
      'battleflame-invoker-spellpower',
      game,
      card.player.hero,
      {
        amount: 2,
        name: 'Battleflame Invoker'
      }
    );

    await card.modifiers.add(
      new Modifier<MinionCard>('battleflame-invoker-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            canSelfApply: false,
            isElligible(candidate) {
              const emberModifier = candidate.modifiers.get(EmberModifier);
              if (!emberModifier) return false;

              return (
                card.location === 'board' &&
                candidate.equals(card.player.hero) &&
                emberModifier.stacks >= 4
              );
            },
            async onGainAura() {
              await card.player.hero.modifiers.add(buff);
            },
            async onLoseAura() {
              await card.player.hero.modifiers.remove(buff);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
