import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { TidesFavoredModifier } from '../../../../modifier/modifiers/tide-modifier';
import dedent from 'dedent';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import type { SpellCard } from '../../../entities/spell.entity';
import { scry } from '../../../card-actions-utils';

export const calmWaters: SpellBlueprint = {
  id: 'calm-waters',
  name: 'Calm Waters',
  cardIconId: 'spell-calm-waters',
  description: dedent`Lower your @Tide@ level. Then, 
  @Tide (1)@ : Draw a card. 
  @Tide (2)@ : Scry 2.

  @[level] 4+@ : This costs 1 less.
  `,
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.WATER,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 4)
    )) as LevelBonusModifier<SpellCard>;
    await card.modifiers.add(
      new Modifier('nova-blast-discount', game, card, {
        mixins: [
          new SpellInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor(value) {
              return levelMod.isActive ? Math.max(value! - 1, 0) : value;
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card) {
    const tidesModifier = card.player.hero.modifiers.get(TidesFavoredModifier);
    if (!tidesModifier) return;

    await tidesModifier.lowerTides();

    if (tidesModifier.stacks === 1) {
      await card.player.cardManager.draw(1);
    } else if (tidesModifier.stacks === 2) {
      await scry(game, card, 2);
    }
  }
};
