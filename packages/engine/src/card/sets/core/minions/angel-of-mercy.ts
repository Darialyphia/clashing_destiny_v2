import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { SpellSchoolAffinityModifier } from '../../../../modifier/modifiers/spell-school-affinity.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import { ProtectorModifier } from '../../../../modifier/modifiers/protector';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const angelOfMercy: MinionBlueprint = {
  id: 'angel-of-mercy',
  name: 'Angel of Mercy',
  cardIconId: 'minions/angel-of-mercy',
  description: dedent`
  @Light Affinity@: @On Death@: Heal your Hero for 6.
  @[level] 3 bonus@: @Protector@.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 5,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const lightMod = (await card.modifiers.add(
      new SpellSchoolAffinityModifier(game, card, SPELL_SCHOOLS.LIGHT)
    )) as SpellSchoolAffinityModifier<MinionCard>;

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          await card.player.hero.heal(6);
        }
      })
    );

    await card.modifiers.add(
      new ProtectorModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => lightMod.isActive)]
      })
    );
  },
  async onPlay() {}
};
