import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { BlitzModifier } from '../../../../modifier/modifiers/blitz.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const spellbladeDuelist: MinionBlueprint = {
  id: 'spellblade-duelist',
  name: 'Spellblade Duelist',
  cardIconId: 'spellblade-duelist',
  description: `This gains +1@[attack]@ and @Blitz@ as long as your hero has at least 3 @[spellpower]@.`,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const buff = new Modifier<MinionCard>('spellblade-duelist-buff', game, card, {
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor(value) {
            return card.player.hero.spellPower >= 3 ? value + 1 : value;
          }
        })
      ]
    });

    await card.modifiers.add(
      new WhileOnBoardModifier('spellblade-duelist', game, card, {
        async onActivate() {
          await card.modifiers.add(buff);
          await card.modifiers.add(new BlitzModifier(game, card));
        },
        async onDeactivate() {
          await card.modifiers.remove(buff);
          await card.modifiers.remove(BlitzModifier);
        }
      })
    );
  },
  async onPlay() {}
};
