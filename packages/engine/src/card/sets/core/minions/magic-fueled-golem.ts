import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.card';

export const magicFueledGolem: MinionBlueprint = {
  id: 'mana-fueled-golem',
  name: 'Mana-Fueled Golem',
  cardIconId: 'mana-fueled-golem',
  description: `This cannot attack or block unless you have at least 3 spellPower.`,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    const buff = new Modifier<MinionCard>('mana-fueled-golem-buff', game, card, {
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor(value) {
            if (!value) return false;
            return card.player.hero.spellPower >= 3;
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBlock',
          interceptor(value) {
            if (!value) return false;
            return card.player.hero.spellPower >= 3;
          }
        })
      ]
    });

    await card.modifiers.add(
      new WhileOnBoardModifier('mana-fueled-golem', game, card, {
        async onActivate() {
          await card.modifiers.add(buff);
        },
        async onDeactivate() {
          await card.modifiers.remove(buff);
        }
      })
    );
  },
  async onPlay() {}
};
