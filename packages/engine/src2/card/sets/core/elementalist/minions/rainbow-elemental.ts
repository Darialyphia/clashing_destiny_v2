import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES,
  TAGS
} from '../../../../card.enums';
import { getWheelOfElementModifier } from '../../../../../modifier/modifiers/wheel-of-elements.modifier';
import { CleaveCardModifier } from '../../../../../modifier/modifiers/cleave.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { BlastCardModifier } from '../../../../../modifier/modifiers/blast.modifier';
import { ShooterModifier } from '../../../../../modifier/modifiers/shooter.modifier';
import { CelerityCardModifier } from '../../../../../modifier/modifiers/celerity.modifier';

export const rainbowElemental: MinionBlueprint = {
  id: 'rainbow_elemental',
  name: 'Rainbow Elemental',
  description: dedent`
   Depending on your current <rt-card>Wheel of the Elements</rt-card> element, this unit has:
<ul>
    <li>Fire: <rt-keyword><rt-keyword>Blast</rt-keyword></li>
    <li>Water: <rt-keyword>Shooter</rt-keyword></li>
    <li>Air: <rt-keyword>Celerity</rt-keyword></li>
    <li>Earth: <rt-keyword>Cleave</rt-keyword></li>
</ul>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.FLYER,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ELEMENTALIST.id],
  manaCost: 5,
  tags: [TAGS.ELEMENTAL],
  atk: 3,
  retaliation: 2,
  maxHp: 7,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new CleaveCardModifier(game, card, {
        unitMixins: [
          new TogglableModifierMixin(game, () => {
            const wheel = getWheelOfElementModifier(game, card.player);
            return wheel?.currentElement === 'earth';
          })
        ]
      })
    );

    await card.modifiers.add(
      new BlastCardModifier(game, card, {
        unitMixins: [
          new TogglableModifierMixin(game, () => {
            const wheel = getWheelOfElementModifier(game, card.player);
            return wheel?.currentElement === 'fire';
          })
        ]
      })
    );

    await card.modifiers.add(
      new ShooterModifier(game, card, {
        unitMixins: [
          new TogglableModifierMixin(game, () => {
            const wheel = getWheelOfElementModifier(game, card.player);
            return wheel?.currentElement === 'water';
          })
        ]
      })
    );

    await card.modifiers.add(
      new CelerityCardModifier(game, card, {
        unitMixins: [
          new TogglableModifierMixin(game, () => {
            const wheel = getWheelOfElementModifier(game, card.player);
            return wheel?.currentElement === 'air';
          })
        ]
      })
    );
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
