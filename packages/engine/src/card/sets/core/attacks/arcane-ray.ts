import { GAME_EVENTS } from '../../../../game/game.events';
import { AttackInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LineageBonusModifier } from '../../../../modifier/modifiers/lineage-bonus.modifier';
import { PercingModifier } from '../../../../modifier/modifiers/percing.modifier';
import type { AttackBlueprint } from '../../../card-blueprint';
import { attackRules, isMinion } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { AttackCard } from '../../../entities/attack.entity';
import type { HeroCard } from '../../../entities/hero.entity';
import { mage } from '../heroes/mage';

export const arcaneRay: AttackBlueprint = {
  id: 'arcane-ray',
  name: 'Arcane Ray',
  cardIconId: 'attack-arcane-ray',
  description: `@Piercing@\n@[lineage] ${mage.name} bonus@: Deals 2 + @[spellpower]@ damage.\nCan only target minions.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  damage: 2,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ATTACK,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: attackRules.getPreResponseTargets(isMinion),
  async onInit(game, card) {
    const lineageMod = new LineageBonusModifier<AttackCard>(game, card, mage.id);
    await card.modifiers.add(lineageMod);

    await card.modifiers.add(
      new Modifier('arcane-ray', game, card, {
        mixins: [
          new AttackInterceptorModifierMixin(game, {
            key: 'damage',
            interceptor(value) {
              return lineageMod.isActive ? value + card.player.hero.spellPower : value;
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card) {
    const percingMod = new PercingModifier<HeroCard>(game, card);

    await card.player.hero.modifiers.add(percingMod);
    game.once(GAME_EVENTS.AFTER_RESOLVE_COMBAT, async () => {
      await card.player.hero.modifiers.remove(percingMod);
    });
  }
};
