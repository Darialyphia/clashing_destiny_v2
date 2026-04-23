import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, emptySpacesTargetRules } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS, TAGS } from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { RingAOEShape } from '../../../../../aoe/ring.aoe-shape';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';

export const lightningStrike: SpellBlueprint = {
  id: 'lightning-strike',
  name: 'Lightning Strike',
  description: dedent`
  Select a empty space. Deal 3 damage to all minions adjacent to that space.
  <rt-lvl-bonus lvl="2"> This costs <rt-mana>1</rt-mana> less.</rt-lvl-bonus>
  <rt-lvl-bonus lvl="4"><rt-keyword>Echo</rt-keyword>.</rt-lvl-bonus> 
  `,
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.AIR],
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
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new SimpleManacostModifier('lightning-strike-discount', game, card, {
        amount: -1,
        mixins: [new TogglableModifierMixin(game, () => lvlMod.isActive)]
      })
    );
    await card.modifiers.add(
      new EchoModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => lvlMod.isActiveForLevel(4))]
      })
    );
  },
  async onPlay(game, card, { targets, aoe }) {
    const units = game.unitSystem.getUnitsInAOE(aoe, targets, card.player);

    for (const unit of units) {
      await unit.takeDamage(card, new SpellDamage(card, 3));
    }
  }
};
