import { MinionInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { getEmpowerStacks } from '../../../../card-actions-utils';
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
  description: 'This cannot attack or block unless your hero is @Empowered@',
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
      bg: 'minions/mana-fueled-golem-bg',
      main: 'minions/mana-fueled-golem',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 3,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier('mana-fueled-golem-atk-buff', game, card, {
        isUnique: true,
        name: 'Powered Down',
        description: 'Cannot attack or block.',
        icon: 'keyword-cannot',
        mixins: [
          new MinionInterceptorModifierMixin(game, {
            key: 'canAttack',
            interceptor: () => false
          }),
          new MinionInterceptorModifierMixin(game, {
            key: 'canBlock',
            interceptor: () => false
          }),
          new TogglableModifierMixin(game, () => getEmpowerStacks(card) === 0)
        ]
      })
    );
  },
  async onPlay() {}
};
