import type { MainDeckCard } from '../board/board.system';
import type { Game } from '../game/game';
import type { AnyCard } from './entities/card.entity';

export const scry = async (game: Game, card: AnyCard, amount: number) => {
  const cards = card.player.cardManager.mainDeck.peek(amount);
  const cardsToPutAtBottom = await game.interaction.chooseCards<MainDeckCard>({
    player: card.player,
    minChoiceCount: 0,
    maxChoiceCount: amount,
    choices: cards,
    label: `Choose up to ${amount} cards to put at the bottom of your deck`
  });

  for (const card of cardsToPutAtBottom) {
    card.player.cardManager.mainDeck.pluck(card);
    card.player.cardManager.mainDeck.addToBottom(card);
  }

  return { cards, cardsToPutAtBottom };
};

export const discover = async (game: Game, card: AnyCard, choicePool: MainDeckCard[]) => {
  const choices: MainDeckCard[] = [];
  for (let i = 0; i < 3; i++) {
    const index = game.rngSystem.nextInt(choicePool.length - 1);
    choices.push(...choicePool.splice(index, 1));
  }
  const [selectedCard] = await game.interaction.chooseCards<MainDeckCard>({
    player: card.player,
    minChoiceCount: 1,
    maxChoiceCount: 1,
    choices,
    label: 'Choose a card to add to your hand'
  });

  await selectedCard.addToHand();

  return { selectedCard, choices };
};
