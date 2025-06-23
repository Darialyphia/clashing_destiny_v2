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

export const pyroclasm: SpellBlueprint<MinionCard | HeroCard> = {
  id: 'pyroclasm',
  name: 'Pyroclasm',
  cardIconId: 'spell-eternal-flame',
  description: `Deal 4 + @[spellpower]@ damage to an enemy.\n@[lineage]`,
  collectable: true,
  unique: false,
  manaCost: 5,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: singleEnemyTargetRules.canPlay,
  getPreResponseTargets: singleEnemyTargetRules.getPreResponseTargets,
  async onInit() {},
  async onPlay(game, card, [target]) {
    await target.takeDamage(card, new SpellDamage(4 + card.player.hero.spellPower));
  }
};
