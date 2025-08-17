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
import { singleEmptyAllySlot } from '../../../card-utils';
import type { MinionPosition } from '../../../../game/interactions/selecting-minion-slots.interaction';
import { blazingSalamander } from './blazing-salamander';

export const battleflameInvoker: MinionBlueprint = {
  id: 'battleflame-invoker',
  name: 'Battleflame Invoker',
  cardIconId: 'unit-battleflame-invoker',
  description: ``,
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
      id: 'battleflame-invoker-ability-1',
      description: '@[exhaust]@ : gain 1 stack of @Ember@.',
      label: 'Gain 1 Ember',
      shouldExhaust: true,
      manaCost: 0,
      canUse: (game, card) => card.location === 'board',
      getPreResponseTargets: async () => [],
      async onResolve(game, card) {
        await card.player.hero.modifiers.add(new EmberModifier(game, card));
      }
    },
    {
      id: 'battleflame-invoker-ability-2',
      description:
        '@[exhaust]@ : consume 4 stacks of @Ember@. Summon a @Blazing Salamander@ on your side of the field',
      label: 'Summon Blazing Salamander',
      shouldExhaust: true,
      manaCost: 0,
      canUse: (game, card) => {
        return singleEmptyAllySlot.canPlay(game, card) && card.location === 'board';
      },
      getPreResponseTargets: async (game, card) =>
        singleEmptyAllySlot.getPreResponseTargets(game, card),
      async onResolve(game, card, targets) {
        const emberModifier = card.player.hero.modifiers.get(EmberModifier);
        if (!emberModifier || emberModifier.stacks < 3) return;
        await emberModifier.removeStacks(3);

        const target = targets[0] as MinionPosition;

        const salamander = await card.player.generateCard<MinionCard>(
          blazingSalamander.id
        );
        await salamander.playAt(target);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {},
  async onPlay() {}
};
