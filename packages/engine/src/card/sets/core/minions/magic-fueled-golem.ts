import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { EchoedDestinyModifier } from '../../../../modifier/modifiers/echoed-destiny.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { TauntModifier } from '../../../../modifier/modifiers/taunt.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.card';

export const magicFueledGolem: MinionBlueprint = {
  id: 'magic-fueled-golem',
  name: 'Magic-Fueled Golem',
  cardIconId: 'unit-mana-fueled-golem',
  description: `This has +2 @[attack]@ and @Taunt@ as long as your hero has at least 2 @[spellpower]@.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 0,
  maxHp: 4,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const atkBuff = new SimpleAttackBuffModifier<MinionCard>(
      'magic-fueled-golem-atk-buff',
      game,
      card,
      {
        amount: 2,
        mixins: [new TogglableModifierMixin(game, () => card.player.hero.spellPower >= 2)]
      }
    );
    const taunt = new TauntModifier<MinionCard>(game, card, {
      mixins: [new TogglableModifierMixin(game, () => card.player.hero.spellPower >= 2)]
    });

    await card.modifiers.add(
      new WhileOnBoardModifier('mana-fueled-golem', game, card, {
        async onActivate() {
          await card.modifiers.add(atkBuff);
          await card.modifiers.add(taunt);
        },
        async onDeactivate() {
          await card.modifiers.remove(atkBuff);
          await card.modifiers.remove(taunt);
        }
      })
    );
  },
  async onPlay() {}
};
