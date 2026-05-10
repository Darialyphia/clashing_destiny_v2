import type { Game } from '../game/game';
import { EmpowerModifier } from '../modifier/modifiers/empower.modifier';
import type { AnyCard } from './entities/card.entity';

export const scry = async (game: Game, card: AnyCard, amount: number) => {
  const cards = card.player.cardManager.mainDeck.peek(amount);

  const result = await game.interaction.rearrangeCards<{
    top: AnyCard[];
    bottom: AnyCard[];
  }>({
    player: card.player,
    source: card,
    canCancel: false,
    label: `Drag cards to put them at the top or bottom of your deck`,
    buckets: [
      { id: 'top', label: 'Top', cards: cards.slice() },
      { id: 'bottom', label: 'Bottom', cards: [] }
    ]
  });

  if (result.cancelled) {
    return { cancelled: true };
  }

  result.result.top.reverse().forEach(card => {
    card.player.cardManager.mainDeck.pluck(card);
    card.player.cardManager.mainDeck.addToTop(card);
  });
  result.result.bottom.reverse().forEach(card => {
    card.player.cardManager.mainDeck.pluck(card);
    card.player.cardManager.mainDeck.addToBottom(card);
  });

  return { cancelled: false, cards, result: result.result };
};

export const discover = async (game: Game, card: AnyCard, choicePool: AnyCard[]) => {
  const choices: AnyCard[] = [];
  const maxChoices = Math.min(3, choicePool.length);

  for (let i = 0; i < maxChoices; i++) {
    const index = game.rngSystem.nextInt(choicePool.length - 1);
    choices.push(...choicePool.splice(index, 1));
  }
  const result = await game.interaction.chooseCards<AnyCard>({
    player: card.player,
    minChoiceCount: 1,
    maxChoiceCount: 1,
    canCancel: false,
    choices: choices.map(c => ({
      card: c,
      aiHints: {
        shouldPick() {
          return 1;
        }
      }
    })),
    timeoutFallback: [choicePool[0]],
    label: 'Choose a card to add to your hand'
  });

  if (result.cancelled) {
    return { cancelled: true };
  }

  const [selectedCard] = result.result;
  await selectedCard.addToHand();

  return { cancelled: false, selectedCard, choices };
};

export const predict = async (game: Game, card: AnyCard) => {
  const choices: AnyCard[] = [];
  const choicePool = Array.from(card.player.cardManager.mainDeck.cards);
  const maxChoices = Math.min(3, choicePool.length);

  for (let i = 0; i < maxChoices; i++) {
    const index = game.rngSystem.nextInt(choicePool.length - 1);
    choices.push(...choicePool.splice(index, 1));
  }
  const result = await game.interaction.chooseCards<AnyCard>({
    player: card.player,
    minChoiceCount: 1,
    maxChoiceCount: 1,
    canCancel: false,
    choices: choices.map(c => ({
      card: c,
      aiHints: {
        shouldPick() {
          return 1;
        }
      }
    })),
    timeoutFallback: [choicePool[0]],
    label: 'Choose a card to put on top of your deck'
  });

  if (result.cancelled) {
    return { cancelled: true };
  }

  const [selectedCard] = result.result;
  await selectedCard.sendToTopOfDeck();

  return { cancelled: false, selectedCard };
};

export const discardFromHand = async (
  game: Game,
  card: AnyCard,
  options: { min: number; max: number }
) => {
  const cards = card.player.cardManager.hand;
  const result = await game.interaction.chooseCards<AnyCard>({
    player: card.player,
    minChoiceCount: options.min,
    maxChoiceCount: options.max,
    canCancel: false,
    choices: cards.map(c => ({
      card: c,
      aiHints: {
        shouldPick() {
          return 1;
        }
      }
    })),
    timeoutFallback: cards.slice(0, options.min),
    label:
      options.min === options.max
        ? `Choose ${options.max} cards to discard`
        : `Choose up to ${options.max} cards to discard`
  });

  if (result.cancelled) {
    return { cancelled: true };
  }

  for (const card of result.result) {
    await card.discard();
  }

  return { cancelled: false, cardsToDiscard: result.result };
};

export const getEmpowerStacks = (card: AnyCard) =>
  card.player.hero.modifiers.list
    .filter(mod => mod instanceof EmpowerModifier)
    .reduce((acc, mod) => acc + mod.stacks, 0);
