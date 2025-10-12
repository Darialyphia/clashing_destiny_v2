import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  isMinion,
  multipleEnemyTargetRules,
  singleEnemyTargetRules
} from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { EfficiencyModifier } from '../../../../modifier/modifiers/efficiency.modifier';
import { EchoedDestinyModifier } from '../../../../modifier/modifiers/echoed-destiny.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { SpellCard } from '../../../entities/spell.entity';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const magicInsight: SpellBlueprint = {
  id: 'magic-insight',
  name: 'Magic Insight',
  cardIconId: 'spells/magic-insight',
  description: dedent`
  Draw a card into your Destiny Zone.
  @[level] 3 bonus@ : This costs @[mana] 1@ less.
  @Echoed Destiny@
  `,
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<SpellCard>;

    await card.modifiers.add(
      new SimpleManacostModifier('magic-insight-discount', game, card, {
        amount: -1,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );
    await card.modifiers.add(new EchoedDestinyModifier(game, card));
  },
  async onPlay(game, card) {
    await card.player.cardManager.drawIntoDestinyZone(1);
  }
};
