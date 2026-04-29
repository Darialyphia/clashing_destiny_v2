import dedent from 'dedent';
import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleEnemyTargetRules } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES } from '../../../../card.enums';
import type { HeroCard } from '../../../../entities/hero-card.entity';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { AbilityDamage } from '../../../../../utils/damage';

export const shootingStar: DestinyBlueprint = {
  id: 'shooting_star',
  name: 'Shooting Star',
  description: dedent`
    <rt-trigger>End of turn</rt-trigger>: Deal damage split among enemy minions equal to half your unspent mana rounded down.
    <rt-lvl-bonus lvl="4">Deal damage equal to your unspent mana instead</rt-lvl-bonus> .
    `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE.id],
  expCost: 3,
  tags: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 4));
  },
  async onPlay(game, card) {
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('shooting-star-aura', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_END,
            async handler() {
              let count = 0;

              const amount = lvlMod.isActive
                ? card.player.mana
                : Math.floor(card.player.mana / 2);
              while (count < amount) {
                const hasRemainingTargets = singleEnemyTargetRules.canPlay(game, card);
                if (!hasRemainingTargets) break;
                const [cell] = await singleEnemyTargetRules.getTargets(game, card, {
                  canCancel: false,
                  timeoutFallback: []
                });
                if (!cell) break;
                await cell.unit?.takeDamage(card, new AbilityDamage(card, 1));
                count++;
              }
            }
          })
        ]
      })
    );
  }
};
