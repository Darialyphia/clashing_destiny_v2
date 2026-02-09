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
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { isMinion } from '../../../../card-utils';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';

export const exaltedAngel: MinionBlueprint = {
  id: 'exalted-angel',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Exalted Angel',
  description: dedent`
    @Honor@.
    Your other minions with @Honor@ have +1 Atk.
  `,
  faction: FACTIONS.ORDER,
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
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 4,
  maxHp: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new HonorModifier(game, card));

    await card.modifiers.add(
      new WhileOnBoardModifier('exalted-angel-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, card, {
            isElligible(candidate) {
              return (
                candidate.isAlly(card) &&
                !candidate.equals(card) &&
                candidate.modifiers.has(HonorModifier) &&
                isMinion(candidate) &&
                candidate.location === CARD_LOCATIONS.HAND
              );
            },
            getModifiers() {
              return [
                new SimpleAttackBuffModifier('exalted-angel-attack-buff', game, card, {
                  amount: 1
                })
              ];
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
