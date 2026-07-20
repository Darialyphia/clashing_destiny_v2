import type { Game } from '../game/game';
import { RUNES } from '../player/player.enums';
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

export const discover = async <T extends AnyCard>(
  game: Game,
  card: AnyCard,
  choicePool: T[]
) => {
  const choices: AnyCard[] = [];
  const maxChoices = Math.min(3, choicePool.length);

  for (let i = 0; i < maxChoices; i++) {
    const index = game.rngSystem.nextInt(choicePool.length - 1);
    choices.push(...choicePool.splice(index, 1));
  }
  const result = await game.interaction.chooseCards<T, false>({
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
  const result = await game.interaction.chooseCards<AnyCard, false>({
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
  options: { min: number; max: number; predicate?: (card: AnyCard) => boolean }
) => {
  const cards = card.player.cardManager.hand.filter(
    c => !options.predicate || options.predicate(c)
  );
  if (cards.length === 0 || cards.length < options.min) {
    return { cancelled: false, discardedCards: [] };
  }

  const result = await game.interaction.chooseCards<AnyCard, false>({
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

  return { cancelled: false, discardedCards: result.result };
};

export const askMandatoryYesNoQuestion = async ({
  game,
  card,
  questionId,
  label,
  timeoutFallback = 'no',
  aiChoice
}: {
  game: Game;
  card: AnyCard;
  questionId: string;
  label: string;
  timeoutFallback?: 'yes' | 'no';
  aiChoice: 'yes' | 'no';
}) => {
  const answer = await game.interaction.askQuestion({
    player: card.player,
    canCancel: false,
    label,
    questionId,
    source: card,
    timeoutFallback,
    choices: [
      {
        id: 'yes',
        label: 'Yes',
        aiHints: {
          shouldPick: () => (aiChoice === 'yes' ? 1 : 0)
        }
      },
      {
        id: 'no',
        label: 'No',
        aiHints: {
          shouldPick: () => (aiChoice === 'no' ? 1 : 0)
        }
      }
    ]
  });
  if (answer.cancelled) return true;

  return answer.result === 'yes';
};

export const chooseColorlessRune = async ({
  game,
  card,
  questionId
}: {
  game: Game;
  card: AnyCard;
  questionId: string;
}) => {
  const runeResult = await game.interaction.askQuestion({
    player: card.player,
    canCancel: false,
    label: 'Choose a rune to consume',
    questionId,
    source: card,
    choices: [
      ...Object.values(RUNES).map(rune => ({
        id: rune,
        label: rune,
        aiHints: { shouldPick: () => 0.5 }
      }))
    ].filter(choice => card.player.runeManager.has({ [choice.id]: 1 })),
    timeoutFallback: RUNES.FOCUS
  });

  return runeResult;
};
