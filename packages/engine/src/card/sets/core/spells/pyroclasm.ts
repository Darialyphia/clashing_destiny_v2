import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LineageBonusModifier } from '../../../../modifier/modifiers/lineage-bonus.modifier';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.card';
import { SpellCard } from '../../../entities/spell.entity';
import { mage } from '../heroes/mage';

export const pyroclasm: SpellBlueprint<MinionCard | HeroCard> = {
  id: 'pyroclasm',
  name: 'Pyroclasm',
  cardIconId: 'spell-eternal-flame',
  description: `Deal 4 + @[spellpower]@ damage to an enemy.\n@[lineage] ${mage.name} bonus@: this costs 2 less.`,
  collectable: true,
  unique: false,
  manaCost: 6,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: singleEnemyTargetRules.canPlay,
  getPreResponseTargets: singleEnemyTargetRules.getPreResponseTargets,
  async onInit(game, card) {
    const lineageMod = new LineageBonusModifier<SpellCard>(game, card, mage.id);
    await card.modifiers.add(lineageMod);

    await card.modifiers.add(
      new Modifier('pyroclasm-discount', game, card, {
        mixins: [
          new SpellInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor(value) {
              return lineageMod.isActive ? Math.max(value! - 2, 0) : value;
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card, [target]) {
    await target.takeDamage(card, new SpellDamage(4 + card.player.hero.spellPower));
  }
};
