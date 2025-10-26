import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { HeroJobAffinityModifier } from '../../../../modifier/modifiers/hero-job-affinity.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { ToughModifier } from '../../../../modifier/modifiers/tough.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { SpellSchoolAffinityModifier } from '../../../../modifier/modifiers/spell-school-affinity.modifier';
import { IntimidateModifier } from '../../../../modifier/modifiers/intimidate.modifier';
import { CleaveModifier } from '../../../../modifier/modifiers/cleave.modifier';

export const pyreArchfiend: MinionBlueprint = {
  id: 'pyre-archfiend',
  name: 'Pyre Archfiend',
  cardIconId: 'minions/pyre-archfiend',
  description: dedent`
  @Fire Affinity@: @Cleave@.
  @Dark Affinity@: @Intimidate (2)@.
  `,
  collectable: true,
  unique: false,
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 4,
  maxHp: 4,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: HERO_JOBS.WARRIOR,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const fireMod = (await card.modifiers.add(
      new SpellSchoolAffinityModifier(game, card, SPELL_SCHOOLS.FIRE)
    )) as SpellSchoolAffinityModifier<MinionCard>;

    const darkMod = (await card.modifiers.add(
      new SpellSchoolAffinityModifier(game, card, SPELL_SCHOOLS.DARK)
    )) as SpellSchoolAffinityModifier<MinionCard>;

    await card.modifiers.add(
      new IntimidateModifier(game, card, {
        minLevel: 2,
        mixins: [new TogglableModifierMixin(game, () => darkMod.isActive)]
      })
    );

    await card.modifiers.add(
      new CleaveModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => fireMod.isActive)]
      })
    );
  },
  async onPlay() {}
};
