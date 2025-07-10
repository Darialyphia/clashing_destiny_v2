import { GAME_EVENTS } from '../../../../game/game.events';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
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
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  affinities: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 20,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      label: 'Draw 2 cards',
      description:
        '@[exhaust]@ @[mana] 2@] : Deal 4 damage to your hero and draw 2 cards.',
      id: 'warlock-ability',
      canUse: () => true,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 1,
      shouldExhaust: true,
      async onResolve(game, card) {
        await card.player.hero.takeDamage(card, new AbilityDamage(4));
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
  },
  talentTree: {
    nodes: [
      {
        id: 'fire-affinity',
        name: 'Fire affinity',
        description: 'Allows you to play Fire cards.',
        destinyCost: 0,
        iconId: 'talent-fire-affinity',
        level: 0,
        parentIds: [],
        async onUnlock(game, hero) {
          await hero.player.unlockAffinity(AFFINITIES.FIRE);
        }
      },
      {
        id: 'arcane-affinity',
        name: 'Arcane affinity',
        description: 'Allows you to play Arcane cards.',
        destinyCost: 0,
        iconId: 'talent-arcane-affinity',
        level: 0,
        parentIds: [],
        async onUnlock(game, hero) {
          await hero.player.unlockAffinity(AFFINITIES.ARCANE);
        }
      },
      {
        id: 'warlock-talent-3',
        name: 'Warlock Talent 3',
        description: 'This is a placeholder for Warlock talent 3.',
        destinyCost: 1,
        iconId: 'talent-test',
        level: 1,
        parentIds: [],
        async onUnlock() {
          console.log('Warlock Talent 3 unlocked');
        }
      },
      {
        id: 'warlock-talent-4',
        name: 'Warlock Talent 4',
        description: 'This is a placeholder for Warlock talent 4.',
        destinyCost: 2,
        iconId: 'talent-test',
        level: 1,
        parentIds: [],
        async onUnlock() {
          console.log('Warlock Talent 4 unlocked');
        }
      },
      {
        id: 'warlock-talent-5',
        name: 'Warlock Talent 5',
        description: 'This is a placeholder for Warlock talent 5.',
        destinyCost: 2,
        iconId: 'talent-test',
        level: 2,
        parentIds: [],
        async onUnlock() {
          console.log('Warlock Talent 5 unlocked');
        }
      }
    ]
  }
};
