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
import { OnHitModifier } from '../../../../../modifier/modifiers/on-hit.modifier';
import { LockedModifier } from '../../../../../modifier/modifiers/locked.modifier';
import { IntimidateModifier } from '../../../../../modifier/modifiers/intimidate.modifier';

export const duskPurifier: MinionBlueprint = {
  id: 'dusk-purifier',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Dusk Purifier',
  description: dedent`
  @On Hero Hit@: @Lock@ a card in the opponent's Destiny zone until the end of next turn.
  @[lvl] 2 Bonus@: @Intimidate 2@.
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
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new IntimidateModifier(game, card, { level: 2 }));

    await card.modifiers.add(
      new OnHitModifier(game, card, {
        async handler(event) {
          if (!event.data.card.equals(card.player.opponent.hero)) return;
          const opponentDestinyZone = Array.from(
            card.player.opponent.cardManager.destinyZone
          );
          if (opponentDestinyZone.length === 0) return;

          const [cardToLock] = await game.interaction.chooseCards({
            player: card.player,
            label: "Choose a card to lock in opponent's Destiny zone",
            minChoiceCount: 1,
            maxChoiceCount: 1,
            choices: opponentDestinyZone,
            timeoutFallback: opponentDestinyZone.slice(0, 1)
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
