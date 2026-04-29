import dedent from 'dedent';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  JOBS,
  TAGS,
  MINION_TYPES
} from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { EverywhereAOEShape } from '../../../../../aoe/everywhere.aoe-shape';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const earthquake: SpellBlueprint = {
  id: 'earthquake',
  name: 'Earthquake',
  description: dedent`
  Deal 4 damage to every non Flyer minion.
  <rt-lvl-bonus lvl="3">This costs 2 less.</rt-lvl-bonus> 
  `,
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.EARTH],
  manaCost: 6,
  canPlay: (game, card) => anywhereTargetRules.canPlay({ min: 1, max: 1 })(game, card),
  getTargets(game, card, onCancel) {
    return anywhereTargetRules.getTargets({ min: 1, max: 1 })(game, card, {
      onCancel,
      canCancel: true
    });
  },
  getAoe: game =>
    new EverywhereAOEShape(TARGETING_TYPE.UNIT, {
      width: game.boardSystem.width,
      height: game.boardSystem.height
    }),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new SimpleManacostModifier('earthquake-discount', game, card, {
        amount: -1,
        mixins: [new TogglableModifierMixin(game, () => lvlMod.isActive)]
      })
    );
  },
  async onPlay(game, card, { targets, aoe }) {
    const units = game.unitSystem
      .getUnitsInAOE(aoe, targets, card.player)
      .filter(u => u.card.subKind !== MINION_TYPES.FLYER);

    for (const unit of units) {
      await unit.takeDamage(card, new SpellDamage(card, 2));
    }
  }
};
