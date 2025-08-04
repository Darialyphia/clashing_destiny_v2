import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { HeroCard } from '../../../entities/hero.entity';

export const powerOverwhelming: SpellBlueprint<MinionCard> = {
  id: 'power-overwhelming',
  name: 'Power Overwhelming',
  cardIconId: 'spell-power-overwhelming',
  description: dedent`This turn, your hero gains @[attack]@ equal to their @[spellpower]@.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.LEGENDARY,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new SimpleAttackBuffModifier<HeroCard>('power_overwhelming_buff', game, card, {
        amount: card.player.hero.spellPower,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
};
