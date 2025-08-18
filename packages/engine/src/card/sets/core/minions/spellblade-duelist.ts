import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { BlitzModifier } from '../../../../modifier/modifiers/blitz.modifier';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const spellbladeDuelist: MinionBlueprint = {
  id: 'spellblade-duelist',
  name: 'Spellblade Duelist',
  cardIconId: 'unit-spellblade-duelist',
  description: `This gains +1@[attack]@, @Rush@ and @Blitz@ as long as your hero has at least 3 @[spellpower]@.`,
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
    await card.modifiers.add(
      new SimpleAttackBuffModifier('spellblade-duelist-atk-buff', game, card, {
        amount: 1,
        mixins: [new TogglableModifierMixin(game, () => card.player.hero.spellPower >= 3)]
      })
    );

    await card.modifiers.add(
      new BlitzModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => card.player.hero.spellPower >= 3)]
      })
    );
    await card.modifiers.add(
      new RushModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => card.player.hero.spellPower >= 3)]
      })
    );
  },
  async onPlay() {}
};
