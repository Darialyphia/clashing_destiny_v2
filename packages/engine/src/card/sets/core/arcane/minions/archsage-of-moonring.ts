import dedent from 'dedent';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { AbilityDamage } from '../../../../../utils/damage';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { LoyaltyModifier } from '../../../../../modifier/modifiers/loyalty.modifier';

export const archsageOfMoonring: MinionBlueprint = {
  id: 'archsage-of-moonring',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Archsage of Moonring',
  description: dedent`
    @Loyalty 1@.
    
    On Enter: Deal 1 damage to a unit. Repeat for every @[knowledge]@ you have.
    `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
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
      breakout: 'placeholder',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 4,
  runeCost: {
    KNOWLEDGE: 2,
    RESONANCE: 1
  },
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new LoyaltyModifier(game, card, { amount: 1 }));

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          let count = 0;
          const max = card.player.unlockedRunes.KNOWLEDGE ?? 0;

          while (count < max) {
            const hasRemainingTargets = singleEnemyTargetRules.canPlay(game, card);
            if (!hasRemainingTargets) break;
            const [target] = await singleEnemyTargetRules.getPreResponseTargets(
              game,
              card,
              {
                type: 'card',
                card
              }
            );

            await target.takeDamage(card, new AbilityDamage(1));
            count++;
          }
        }
      })
    );
  },
  async onPlay() {}
};
