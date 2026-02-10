import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { MinionCard } from '../../../../entities/minion.entity';
import { scry } from '../../../../card-actions-utils';
import { AbilityDamage } from '../../../../../utils/damage';
import { jeweller } from './jeweller';

export const plottingCounsellor: MinionBlueprint = {
  id: 'plotting-consellor',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Plotting Counsellor',
  // use a function for description to avoid circular dependency issues
  description: () =>
    dedent`At the end of each turn, if this card has only 1 Hp, banish this and summon a @${jeweller.name}@.`,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.TOKEN,
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
      tint: FACTIONS.NEUTRAL.defaultCardTint
    }
  },
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 5,
  canPlay: () => true,
  abilities: [
    {
      id: 'plotting-consellor-ability',
      description: dedent`
      Deal 1 damage to this. @Scry 2@, then draw a card.
      `,
      label: 'Scry and draw',
      canUse: () => true,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 2,
      shouldExhaust: false,
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        await scry(game, card, 2);
        await card.player.cardManager.draw(1);

        await card.takeDamage(card, new AbilityDamage(1));
      }
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<MinionCard>('end-of-turn-plotting-consellor', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_END,
            async handler() {
              if (card.remainingHp > 1) return;
              await card.sendToBanishPile();
              const jeweller = await card.player.generateCard<MinionCard>('jeweller');
              await jeweller.playImmediately();
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
