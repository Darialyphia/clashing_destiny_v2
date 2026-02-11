import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  CARD_LOCATIONS
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { getEmpowerStacks } from '../../../../card-actions-utils';

export const tailOfSimurgh: SpellBlueprint = {
  id: 'tail-of-simurgh',
  kind: CARD_KINDS.SPELL,
  collectable: false,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Tail of Simurgh',
  description: dedent`
    Return an enemy minion to its owner's hand. If you're @Empowered@, place it on the top of the deck instead.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.TOKEN,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: () => true,
  async getPreResponseTargets(game, card) {
    const enemyMinions = card.player.opponent.minions;

    if (enemyMinions.length === 0) {
      return [];
    }

    return await game.interaction.chooseCards<MinionCard>({
      player: card.player,
      label: 'Select an enemy minion',
      choices: enemyMinions,
      minChoiceCount: 1,
      maxChoiceCount: 1,
      timeoutFallback: enemyMinions.slice(0, 1)
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const isEmpowered = getEmpowerStacks(card) > 0;

    for (const target of targets as MinionCard[]) {
      if (target.location !== CARD_LOCATIONS.BOARD) continue;

      target.removeFromCurrentLocation();

      if (isEmpowered) {
        if (target.deckSource === CARD_DECK_SOURCES.DESTINY_DECK) {
          await target.sendToBanishPile();
        } else {
          target.player.cardManager.mainDeck.addToTop(target);
        }
      } else {
        await target.addToHand();
      }
    }
  }
};
