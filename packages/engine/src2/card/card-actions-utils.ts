import type { Game } from '../game/game';
import type { AnyCard } from './entities/card.entity';
import { type DeckCard } from './components/card-manager.component';
import { EmpowerModifier } from '../modifier/modifiers/empower.modifier';

export const discover = async (game: Game, card: AnyCard, choicePool: DeckCard[]) => {
  const choices: DeckCard[] = [];
  for (let i = 0; i < 3; i++) {
    const index = game.rngSystem.nextInt(choicePool.length - 1);
    choices.push(...choicePool.splice(index, 1));
  }
  const [selectedCard] = await game.interaction.chooseCards<DeckCard>({
    player: card.player,
    minChoiceCount: 1,
    maxChoiceCount: 1,
    choices,
    label: 'Choose a card to add to your hand',
    source: card,
    timeoutFallback: [choices[0]]
  });
  if (!selectedCard) return { selectedCard: null, choices };
  await selectedCard.addToHand();

  return { selectedCard, choices };
};

export const predict = async (game: Game, card: AnyCard) => {
  const choices: DeckCard[] = [];
  for (let i = 0; i < 3; i++) {
    const index = game.rngSystem.nextInt(card.player.cardManager.deck.cards.length - 1);
    choices.push(card.player.cardManager.deck.cards[index]);
  }
  const [selectedCard] = await game.interaction.chooseCards<DeckCard>({
    player: card.player,
    minChoiceCount: 1,
    maxChoiceCount: 1,
    choices,
    label: 'Choose a card to put on top of your deck',
    source: card,
    timeoutFallback: [choices[0]]
  });
  if (!selectedCard) return;
  await selectedCard.sendToTopOfDeck();
};

export const getEmpowerStacks = (card: AnyCard) =>
  card.player.hero.modifiers.list
    .filter(mod => mod instanceof EmpowerModifier)
    .reduce((acc, mod) => acc + mod.stacks, 0);

export const discardFromHand = async (
  game: Game,
  card: AnyCard,
  options: { min: number; max: number }
) => {
  const cards = card.player.cardManager.hand;
  const cardsToDiscard = await game.interaction.chooseCards<AnyCard>({
    player: card.player,
    source: card,
    minChoiceCount: options.min,
    maxChoiceCount: options.max,
    choices: cards,
    timeoutFallback: cards.slice(0, options.min),
    label:
      options.min === options.max
        ? `Choose ${options.max} cards to discard`
        : `Choose up to ${options.max} cards to discard`
  });

  for (const card of cardsToDiscard) {
    await card.discard();
  }

  return cardsToDiscard;
};
