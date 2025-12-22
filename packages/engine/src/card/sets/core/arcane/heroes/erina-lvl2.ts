import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { isSpell } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';

export const erinaLv2: HeroBlueprint = {
  id: 'erina-aether-scholar',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Erina, Aether Scholar',
  description: 'This has +2 Attack as long as you played a spell this turn.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
  tags: [],
  art: {
    default: {
      foil: {
        oil: true,
        lightGradient: true
      },
      dimensions: {
        width: 174,
        height: 140
      },
      bg: 'heroes/erina-lv2-bg',
      main: 'heroes/erina-lv2',
      breakout: 'heroes/erina-lv2-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 2,
  runeCost: {},
  level: 2,
  lineage: 'erina',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 18,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleAttackBuffModifier('erina-lv2-attack-buff', game, card, {
        amount: 1,
        mixins: [
          new TogglableModifierMixin(
            game,
            () =>
              card.player.cardTracker.getCardsPlayedThisGameTurnOfKind(CARD_KINDS.SPELL)
                .length > 0
          )
        ]
      })
    );
  },
  async onPlay() {}
};
