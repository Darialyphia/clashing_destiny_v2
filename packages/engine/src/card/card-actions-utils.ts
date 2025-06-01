import type { MainDeckCard } from '../board/board.system';
import type { Game } from '../game/game';
import type { AnyCard } from './entities/card.entity';

export const scry = async (game: Game, card: AnyCard, amount: number) => {
  const cards = card.player.cardManager.mainDeck.peek(amount);
  const cardsToPutAtBottom = await game.interaction.chooseCards<MainDeckCard>({
    player: card.player,
    minChoiceCount: 0,
    maxChoiceCount: amount,
    choices: cards
  });

  for (const card of cardsToPutAtBottom) {
    card.player.cardManager.mainDeck.pluck(card);
    card.player.cardManager.mainDeck.addToBottom(card);
  }

  return { cards, cardsToPutAtBottom };
};
