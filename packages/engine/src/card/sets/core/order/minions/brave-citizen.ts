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
import { PrideModifier } from '../../../../../modifier/modifiers/pride.modifier';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

export const braveCitizen: MinionBlueprint = {
  id: 'brave-citizen',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Brave Citizen',
  description: dedent`
   @Pride 1@
   @On Attack@: this gains +1 Atk this turn.
  `,
  faction: FACTIONS.ORDER,
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
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new PrideModifier(game, card, 1));

    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          await card.modifiers.add(
            new SimpleAttackBuffModifier('brave-citizen-attack-buff', game, card, {
              amount: 1,
              mixins: [new UntilEndOfTurnModifierMixin(game)]
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
