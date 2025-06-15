import { GAME_EVENTS } from '../../../../game/game.events';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { HeroBlueprint } from '../../../card-blueprint';
import { isMinion } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const warlock: HeroBlueprint = {
  id: 'warlock',
  name: 'Warlock',
  description:
    '@On Enter@ : Deal 2 damage to all minions. Gain +1 @[spellpower]@  until the end of the turn equal to the amount of minions destroyed this way.',
  cardIconId: 'hero-warlock',
  level: 3,
  destinyCost: 3,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [AFFINITIES.BLOOD, AFFINITIES.VOID, AFFINITIES.FIRE],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 1,
  atk: 0,
  maxHp: 24,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      label: 'Draw 2 cards',
      description:
        '@[exhaust]@ @[mana] 2@] : Deal 3 damage to your hero and draw 2 cards.',
      id: 'warlock-ability',
      canUse: () => true,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 1,
      shouldExhaust: true,
      async onResolve(game, card) {
        await card.player.hero.takeDamage(card, new AbilityDamage(3));
        await card.player.cardManager.draw(2);
      }
    }
  ],
  tags: [],
  async onInit() {},
  async onPlay(game, card) {
    let destroyedMinions = 0;
    const stop = game.on(GAME_EVENTS.CARD_AFTER_DESTROY, event => {
      if (isMinion(event.data.card)) {
        destroyedMinions++;
      }
    });
    const minions = [...card.player.minions, ...card.player.opponent.minions];
    for (const minion of minions) {
      await minion.takeDamage(card, new AbilityDamage(2));
    }
    stop();

    await card.player.hero.modifiers.add(
      new SimpleSpellpowerBuffModifier('warlock-spellpower', game, card, {
        amount: destroyedMinions,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
};
