import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import { FlankModifier } from '../../../../modifier/modifiers/flank.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { RangedModifier } from '../../../../modifier/modifiers/ranged.modifier';

export const kenWizardProdigy: MinionBlueprint = {
  id: 'ken-wizard-prodigy',
  name: 'Ken, wizard Prodigy',
  cardIconId: 'minions/ken-wizard-prodigy',
  description: dedent`
  @Unique@.
  this has @Ranged@ and @Flank@ as long as your Hero has @Spellpower@.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 4,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: HERO_JOBS.MAGE,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new FlankModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => card.player.hero.spellPower > 0)]
      })
    );
    await card.modifiers.add(
      new RangedModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => card.player.hero.spellPower > 0)]
      })
    );
  },
  async onPlay() {}
};
