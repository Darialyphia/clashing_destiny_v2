import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { SpellBlueprint } from '../../../card-blueprint';
import { isMinion, singleAllyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  HERO_JOBS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { HeroJobAffinityModifier } from '../../../../modifier/modifiers/hero-job-affinity.modifier';

export const manaShield: SpellBlueprint = {
  id: 'mana-shield',
  name: 'Mana Shield',
  cardIconId: 'spells/mana-shield',
  description: dedent`
  The next time target ally takes damage this turn, negate 1 + Hero level of that damage. 
  @Mage Affinity@ : Draw a card into your Destiny zone.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: singleAllyTargetRules.canPlay,
  getPreResponseTargets(game, card) {
    return singleAllyTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit(game, card) {
    await card.modifiers.add(new HeroJobAffinityModifier(game, card, HERO_JOBS.MAGE));
  },
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    await target.modifiers.add(
      new Modifier<MinionCard>('mana-shield', game, target, {
        mixins: [
          new MinionInterceptorModifierMixin(game, {
            key: 'receivedDamage',
            interceptor: value => {
              const damageToNegate = 1 + card.player.hero.level;
              const newValue = Math.max(0, value - damageToNegate);
              return newValue;
            }
          }),
          new GameEventModifierMixin(game, {
            eventName: isMinion(target)
              ? GAME_EVENTS.MINION_AFTER_TAKE_DAMAGE
              : GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE,
            async handler(event, modifier) {
              if (event.data.card.equals(card)) {
                await card.modifiers.remove(modifier.modifierType);
              }
            }
          })
        ]
      })
    );

    const heroMod = card.modifiers.get(HeroJobAffinityModifier);
    if (heroMod?.isActive) {
      await card.player.cardManager.drawIntoDestinyZone(1);
    }
  }
};
