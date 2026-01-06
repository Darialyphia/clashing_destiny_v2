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
import { AttackerModifier } from '../../../../../modifier/modifiers/attacker.modifier';
import { DefenderModifier } from '../../../../../modifier/modifiers/defender.modifier';
import { MinionInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';

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
    @Attacker@: +1 Atk
    @Defender@: +1 Hp
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
      new AttackerModifier(game, card, {
        mixins: [
          new MinionInterceptorModifierMixin(game, {
            key: 'atk',
            interceptor: value => value + 1
          })
        ]
      })
    );

    await card.modifiers.add(
      new DefenderModifier(game, card, {
        mixins: [
          new MinionInterceptorModifierMixin(game, {
            key: 'maxHp',
            interceptor: value => value + 1
          })
        ]
      })
    );
  },
  async onPlay() {}
};
