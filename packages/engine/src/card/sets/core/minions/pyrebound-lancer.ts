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
import { fireBolt } from '../spells/fire-bolt';
import { PiercingModifier } from '../../../../modifier/modifiers/percing.modifier';
import { OnHitModifier } from '../../../../modifier/modifiers/on-hit.modifier';
import { SpellSchoolAffinityModifier } from '../../../../modifier/modifiers/spell-school-affinity.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { OnKillModifier } from '../../../../modifier/modifiers/on-kill.modifier';

export const pyreboundLancer: MinionBlueprint = {
  id: 'pyrebound-lancer',
  name: 'Pyrebound Lancer',
  cardIconId: 'minions/pyrebound-lancer',
  description: dedent`
  @Piercing@.
  @Fire Affinity@: @On Kill@ : for each target hit, add a @${fireBolt.name}@ to your hand.
  `,
  collectable: true,
  unique: false,
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 2,
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
    await card.modifiers.add(new PiercingModifier(game, card));
    const affinityMod = (await card.modifiers.add(
      new SpellSchoolAffinityModifier(game, card, SPELL_SCHOOLS.FIRE)
    )) as SpellSchoolAffinityModifier<MinionCard>;

    await card.modifiers.add(
      new OnKillModifier(game, card, {
        handler: async event => {
          const count = event.data.affectedCards.length;
          for (let i = 0; i < count; i++) {
            const spell = await card.player.generateCard(fireBolt.id);
            await card.player.cardManager.addToHand(spell);
          }
        },
        mixins: [new TogglableModifierMixin(game, () => affinityMod.isActive)]
      })
    );
  },
  async onPlay() {}
};
