import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  emptySpacesTargetRules,
  isSpell,
  singleMinionTargetRules
} from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS, TAGS } from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { isDefined } from '@game/shared';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { CardInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import type { SpellCard } from '../../../../entities/spell-card.entity';

export const airShard: SpellBlueprint = {
  id: 'air-shard',
  name: 'Air Shard',
  description: dedent`
  Relocate a minion.
  Costs <rt-mana>0</rt-mana> if you played an Air spell this turn.
  `,
  kind: CARD_KINDS.SPELL,
  collectable: false,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.AIR],
  manaCost: 1,
  canPlay: (game, card) => {
    return singleMinionTargetRules.canPlay(game, card, c =>
      emptySpacesTargetRules.canPlay({ min: 1 })(game, c2 => c2.player?.equals(c.player))
    );
  },
  async getTargets(game, card, onCancel) {
    const [first] = await singleMinionTargetRules.getTargets(game, card, {
      canCancel: true,
      onCancel,
      predicate: unit => unit.isAlly(card.player),
      getAoe(selectedSpaces) {
        return card.getAOE(selectedSpaces);
      },
      timeoutFallback: []
    });
    if (!first) {
      return [];
    }

    const [second] = await emptySpacesTargetRules.getTargets({ min: 1, max: 1 })(
      game,
      card,
      {
        canCancel: true,
        onCancel,
        predicate: cell => cell.player.equals(first.player),
        getAoe(selectedSpaces) {
          return card.getAOE(selectedSpaces);
        },
        getLabel() {
          return `${card.blueprint.name} : Select the space to teleport to`;
        },
        timeoutFallback: []
      }
    );

    return [first, second].filter(isDefined);
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<SpellCard>('air-shard-discount', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () =>
            card.player.cardTracker.hasPlayedThisTurn(
              c => isSpell(c) && c.hasTag(TAGS.AIR)
            )
          ),
          new CardInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor: () => {
              return 0;
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card, { targets }) {
    if (targets.length < 2) return;
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    const destination = game.boardSystem.getCellAt(targets[1]);
    if (!destination) return;
    if (destination.isOccupied) return;

    await target.teleport(destination);
  }
};
