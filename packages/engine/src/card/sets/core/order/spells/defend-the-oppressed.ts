import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { braveCitizen } from '../minions/brave-citizen';
import { SimpleDestinyCostModifier } from '../../../../../modifier/modifiers/simple-destinycost.modifier';
import { isMinion } from '../../../../card-utils';
import type { MinionCard } from '../../../../entities/minion.entity';

export const defendTheOppressed: SpellBlueprint = {
  id: 'defend-the-oppressed',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Defend the Oppressed',
  description: dedent`
   Summon 2 @${braveCitizen.name}@.
   Costs 1 less for each ally minion that died this turn.
  `,
  dynamicDescription: (game, card) => {
    const discount = card.player.cardTracker.cardsDestroyedThisGameTurn.filter(
      c => c.card.isAlly(card) && isMinion(c.card)
    ).length;
    const destinyCost = Math.max(0, 3 - discount);
    return dedent`
   Summon 2 @${braveCitizen.name}@.
   Costs @[dynamic]${destinyCost}|3 - 1 for each ally minion that died this turn@ less.
  `;
  },
  faction: FACTIONS.ORDER,
  rarity: RARITIES.RARE,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  destinyCost: 3,
  speed: CARD_SPEED.BURST,
  abilities: [],
  canPlay() {
    return true;
  },
  getPreResponseTargets() {
    return Promise.resolve([]);
  },
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleDestinyCostModifier(
        'defend-the-oppressed-destiny-cost-discount',
        game,
        card,
        {
          amount: () =>
            card.player.cardTracker.cardsDestroyedThisGameTurn.filter(
              c => c.card.isAlly(card) && isMinion(c.card)
            ).length
        }
      )
    );
  },
  async onPlay(game, card) {
    for (let i = 0; i < 2; i++) {
      const citizen = await card.player.generateCard<MinionCard>(braveCitizen.id);
      await citizen.playImmediately();
    }
  }
};
