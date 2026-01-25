import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { SimpleDestinyCostModifier } from '../../../../../modifier/modifiers/simple-destinycost.modifier';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';

export const belovedMentor: MinionBlueprint = {
  id: 'beloved-mentor',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Beloved Mentor',
  description: dedent`
  Your hero cards cost @[destiny] 1@ less to play.
  `,
  faction: FACTIONS.NEUTRAL,
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
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.NEUTRAL.defaultCardTint
    }
  },
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier('beloved-mentor-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, card, {
            isElligible(candidate) {
              return (
                candidate.kind === CARD_KINDS.HERO &&
                candidate.location === CARD_LOCATIONS.DESTINY_DECK &&
                candidate.isAlly(card)
              );
            },
            getModifiers(candidate) {
              return [
                new SimpleDestinyCostModifier(
                  'beloved-mentor-destiny-cost-reduction',
                  game,
                  candidate,
                  {
                    amount: -1
                  }
                )
              ];
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
