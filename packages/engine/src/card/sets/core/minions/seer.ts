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
import type { MinionCard } from '../../../entities/minion.card';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const seer: MinionBlueprint = {
  id: 'seer',
  name: 'Seer',
  cardIconId: 'seer',
  description: `@On Enter@: @Scry 3. @Level 3 bonus@: Give your hero +1 Spellpower until end of turn for each Arcane card scryed.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = new LevelBonusModifier<MinionCard>(game, card, 3);
    await card.modifiers.add(levelMod);
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        const { cards } = await scry(game, card, 3);
        if (levelMod.isActive) {
          const arcaneCards = cards.filter(c => c.affinity === AFFINITIES.ARCANE);
          if (arcaneCards.length === 0) return;

          await card.player.hero.modifiers.add(
            new SimpleSpellpowerBuffModifier('seer-spellpower-buff', game, card, {
              amount: arcaneCards.length,
              mixins: [new UntilEndOfTurnModifierMixin(game)]
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
