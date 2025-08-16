import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import { scry } from '../../../card-actions-utils';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { MinionCard } from '../../../entities/minion.entity';
import dedent from 'dedent';

export const seer: MinionBlueprint = {
  id: 'seer',
  name: 'Seer',
  cardIconId: 'unit-seer',
  description: dedent`
  @On Enter@ : @Scry 3@.
  @[level] 3+ bonus@ Draw a card.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = new LevelBonusModifier<MinionCard>(game, card, 3);
    await card.modifiers.add(levelMod);

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          await scry(game, card, 3);

          if (!levelMod.isActive) return;
          await card.player.cardManager.draw(1);
        }
      })
    );
  },
  async onPlay() {}
};
