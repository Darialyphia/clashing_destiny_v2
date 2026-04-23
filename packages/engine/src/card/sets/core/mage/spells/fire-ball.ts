import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, emptySpacesTargetRules } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS, TAGS } from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { RingAOEShape } from '../../../../../aoe/ring.aoe-shape';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { BurnModifier } from '../../../../../modifier/modifiers/burn.modifier';

export const fireBall: SpellBlueprint = {
  id: 'fire-ball',
  name: 'Fire Ball',
  description: dedent`
  Deal 4 damage to a minion. Give <rt-keyword>Burn (2)</rt-keyword> to adjacent enemies.
  <rt-lvl-bonus lvl="3">This deals 2 damage to adjacent minions.</rt-lvl-bonus> 
  <rt-lvl-bonus lvl="5"> This costs <rt-mana>2</rt-mana> less.</rt-lvl-bonus>
  `,
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.FIRE],
  manaCost: 4,
  canPlay: (game, card) =>
    emptySpacesTargetRules.canPlay({ min: 1 })(
      game,
      cell => !!cell.player?.equals(card.player)
    ),
  getTargets(game, card, onCancel) {
    return emptySpacesTargetRules.getTargets({ min: 1, max: 1 })(game, card, {
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
    await card.modifiers.add(new LevelBonusModifier(game, card, 5));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new SimpleManacostModifier('lightning-strike-discount', game, card, {
        amount: -2,
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
      if (lvlMod.isActiveForLevel(3)) {
        await unit.takeDamage(card, new SpellDamage(card, 2));
      }
    }
  }
};
