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
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { isMinion } from '../../../../card-utils';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';
import { GAME_PHASES } from '../../../../../game/game.enums';
import type { MinionCard } from '../../../../entities/minion.entity';

export const secondWings: MinionBlueprint = {
  id: 'second-wings',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Second Wings',
  description: dedent`
    @Honor@.
    @On Death@: Summon a minion from your deck with @Honor@ that costs 2 or less.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
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
  atk: 3,
  maxHp: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new HonorModifier(game, card));
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          const choices = card.player.cardManager.mainDeck.cards.filter(
            c => isMinion(c) && c.manaCost <= 2 && c.modifiers.has(HonorModifier)
          );

          if (choices.length === 0) return;

          const [selected] = await game.interaction.chooseCards<MinionCard>({
            player: card.player,
            minChoiceCount: 1,
            maxChoiceCount: 1,
            choices,
            label: 'Select a minion to summon '
          });

          await selected.playImmediately();
        }
      })
    );
  },
  async onPlay() {}
};
