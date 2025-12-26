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
import { match } from 'ts-pattern';
import { scry } from '../../../../card-actions-utils';
import { AbilityDamage } from '../../../../../utils/damage';

export const plottingConsellor: MinionBlueprint = {
  id: 'plotting-consellor',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Plotting Consellor',
  description: dedent`At the end of each turn, if this card has only 1 Hp, banish this and summon a @Jeweller@ in its place.`,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
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
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 3,
  maxHp: 3,
  canPlay: () => true,
  abilities: [
    {
      id: 'plotting-consellor-ability',
      description: dedent`
      Deal 1 damage to this, then choose one:
          • Exhaust an enemy minion.
          • @Scry 2@, then draw a card.
      `,
      label: 'Exhaust or Scry',
      canUse: () => true,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 3,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        const answer = await game.interaction.askQuestion({
          questionId: 'plotting-consellor-ability-choice',
          source: card,
          player: card.player,
          label: 'Choose one effect',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          choices: [
            { label: 'Exhaust an enemy minion', id: 'exhaust' },
            { label: 'Scry 2, then draw a card', id: 'scry' }
          ]
        });

        await match(answer as 'exhaust' | 'scry')
          .with('exhaust', async () => {
            const enemies = card.player.opponent.enemyMinions;
            if (enemies.length === 0) return;
            const [target] = await game.interaction.chooseCards({
              player: card.player,
              label: 'Choose an enemy minion to exhaust',
              maxChoiceCount: 1,
              minChoiceCount: 1,
              choices: enemies
            });

            await target.exhaust();
          })
          .with('scry', async () => {
            await scry(game, card, 2);
            await card.player.cardManager.draw(1);
          })
          .exhaustive();

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
              const zone = card.zone!;
              await card.sendToBanishPile();
              const jeweller = await card.player.generateCard<MinionCard>('jeweller');
              await jeweller.playImmediatelyAt(zone);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
