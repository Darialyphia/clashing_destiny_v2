import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import { AbilityDamage } from '../../../../../utils/damage';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isSpell } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES, TAGS } from '../../../../card.enums';
import type { HeroCard } from '../../../../entities/hero-card.entity';

export const fireMastery: DestinyBlueprint = {
  id: 'fire_mastery',
  name: 'Fire Mastery',
  description: 'When you play a fire spell, deal 1 damage to the enemy hero.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE.id],
  expCost: 2,
  tags: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('fire-mastery-aura', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter: event => {
              if (!event) return false;
              const candidate = event.data.card;
              return (
                candidate.player.equals(card.player) &&
                candidate.hasTag(TAGS.FIRE) &&
                isSpell(candidate)
              );
            },
            handler: async () => {
              await card.player.opponent.takeDamage(card, new AbilityDamage(card, 1));
            }
          })
        ]
      })
    );
  }
};
