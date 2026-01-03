import dedent from 'dedent';
import { OnHitModifier } from '../../../../../modifier/modifiers/on-hit.modifier';
import { OverwhelmModifier } from '../../../../../modifier/modifiers/overwhelm.modifier';
import { PrideModifier } from '../../../../../modifier/modifiers/pride.modifier';
import { HinderedModifier } from '../../../../../modifier/modifiers/hindered.modifier';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { manaSpark } from '../../neutral/spells/mana-spark';

export const cosmicAvatar: MinionBlueprint = {
  id: 'cosmic-avatar',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Cosmic Avatar',
  description: dedent`
    @Pride 3@, @Hindered 2@, @Overwhelm@.
    @On Hero Hit@: You may @Empower@ 2. If you don't, add a @Mana Spark@ to your hand for each damage dealt.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'minions/cosmic-avatar-bg',
      main: 'minions/cosmic-avatar',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 3,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new PrideModifier(game, card, 3));
    await card.modifiers.add(new HinderedModifier(game, card, 2));
    await card.modifiers.add(new OverwhelmModifier(game, card));

    await card.modifiers.add(
      new OnHitModifier(game, card, {
        async handler(event) {
          if (!event.data.card.equals(card.player.opponent.hero)) return;

          const damageDealt = event.data.damage.baseAmount;

          const answer = await game.interaction.askQuestion({
            player: card.player,
            source: card,
            questionId: `cosmic-avatar-empower-${card.id}`,
            label: `Empower 2, or add ${damageDealt} Mana Spark(s) to your hand?`,
            minChoiceCount: 1,
            maxChoiceCount: 1,
            choices: [
              { id: 'empower', label: 'Empower 2' },
              { id: 'sparks', label: `Add ${damageDealt} Mana Spark(s)` }
            ]
          });

          if (answer === 'empower') {
            await card.player.hero.modifiers.add(
              new EmpowerModifier(game, card, { amount: 2 })
            );
          } else {
            for (let i = 0; i < damageDealt; i++) {
              const spark = await card.player.generateCard(manaSpark.id);
              await spark.addToHand();
            }
          }
        }
      })
    );
  },
  async onPlay() {}
};
