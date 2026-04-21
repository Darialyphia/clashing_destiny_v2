import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS } from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { RingAOEShape } from '../../../../../aoe/ring.aoe-shape';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { BurnModifier } from '../../../../../modifier/modifiers/burn.modifier';

export const peerIntoTheEssence: SpellBlueprint = {
  id: 'peer-into-the-essence',
  name: 'Peer into the Essence',
  description: dedent`
  <rt-keyword>Discover</rt-keyword> a spell from your deck. Cycle your <rt-card>Wheel of the Elements</rt-card> to the element of your choice.
   `,
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.ELEMENTALIST.id],
  tags: [],
  manaCost: 2,
  canPlay: () => true,
  getTargets(game, card, onCancel) {
    return anywhereTargetRules.getTargets({ min: 1, max: 1 })(game, card, {
      predicate: cell => !!cell.player?.equals(card.player),
      getAoe: () => new PointAOEShape(TARGETING_TYPE.EMPTY, {}),
      canCancel: true,
      onCancel,
      timeoutFallback: []
    });
  },
  getAoe: () =>
    new RingAOEShape(TARGETING_TYPE.ENEMY_UNIT, {
      includeDiagonals: false,
      includeCenter: false
    }),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new SimpleManacostModifier('lightning-strike-discount', game, card, {
        amount: -1,
        mixins: [new TogglableModifierMixin(game, () => lvlMod.isActive)]
      })
    );
  },
  async onPlay(game, card, { targets, aoe }) {
    const mainTarget = targets[0];
    await mainTarget.unit?.takeDamage(card, new SpellDamage(card, 4));

    const units = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    for (const unit of units) {
      await unit.modifiers.add(new BurnModifier(game, card, { stacks: 2 }));
      if (lvlMod.isActiveForLevel(4)) {
        await unit.takeDamage(card, new SpellDamage(card, 2));
      }
    }
  }
};
