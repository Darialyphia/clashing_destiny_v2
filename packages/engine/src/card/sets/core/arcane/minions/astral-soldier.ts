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
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { empower } from '../../../../card-actions-utils';
import { ForesightModifier } from '../../../../../modifier/modifiers/foresight.modifier';

export const astralSoldier: MinionBlueprint = {
  id: 'astral-soldier',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Astral Soldier',
  description: dedent`
  @On Enter@: You may @Consume@ @[knowledge]@. If you do, @Empower 1@.
  
  @Foresight@.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
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
  manaCost: 2,
  runeCost: {
    MIGHT: 1
  },
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new ForesightModifier(game, card));

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const [shouldConsume] = await game.interaction.askQuestion({
            player: card.player,
            source: card,
            label: 'Consume 1 Knowledge to Empower 1?',
            minChoiceCount: 0,
            maxChoiceCount: 1,
            choices: [
              { id: 'yes', label: 'Yes' },
              { id: 'no', label: 'No' }
            ]
          });

          if (shouldConsume === 'no') return;

          await card.player.spendRune({ KNOWLEDGE: 1 });
          empower(game, card, 1);
        }
      })
    );
  },
  async onPlay() {}
};
