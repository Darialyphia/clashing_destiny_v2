import { MinionInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';

export const manaFueledGolem: MinionBlueprint = {
  id: 'mana-fueled-golem',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Mana-Fueled Golem',
  description: 'This has +Attack equal to your @Spellpower@.',
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
  manaCost: 3,
  runeCost: {
    MIGHT: 2,
    KNOWLEDGE: 1
  },
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier('mana-fueled-golem-atk-buff', game, card, {
        isUnique: true,
        name: 'Mana-Fueled Golem Attack Buff',
        description: 'This has +ATK equals to your Spellpower.',
        icon: 'keyword-attack-buff',
        mixins: [
          new MinionInterceptorModifierMixin(game, {
            key: 'atk',
            interceptor: value => value + card.player.hero.spellPower
          })
        ]
      })
    );
  },
  async onPlay() {}
};
