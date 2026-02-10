import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { PrideModifier } from '../../../../../modifier/modifiers/pride.modifier';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { LockedModifier } from '../../../../../modifier/modifiers/locked.modifier';

export const whiteLion: MinionBlueprint = {
  id: 'white-lion',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'White Lion',
  description: dedent`
   @Pride 2@
   @On Enter@: @Lock@ a card in the opponent's Destiny zone until the end of next turn.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.RARE,
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
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new PrideModifier(game, card, 2));

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const opponentDestinyZone = Array.from(
            card.player.opponent.cardManager.destinyZone
          );
          if (opponentDestinyZone.length === 0) return;

          const [cardToLock] = await game.interaction.chooseCards({
            player: card.player,
            label: "Choose a card to lock in opponent's Destiny zone",
            minChoiceCount: 1,
            maxChoiceCount: 1,
            choices: opponentDestinyZone
          });

          await cardToLock.modifiers.add(
            new LockedModifier(game, card, {
              stacks: 2
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
