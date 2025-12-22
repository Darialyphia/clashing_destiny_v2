import type { Game } from '../game/game';
import { GAME_EVENTS } from '../game/game.events';
import { EmpowerModifier } from '../modifier/modifiers/empower.modifier';
import { SimpleSpellpowerBuffModifier } from '../modifier/modifiers/simple-spellpower.buff.modifier';
import { KEYWORDS } from './card-keywords';
import { isSpell } from './card-utils';
import type { AnyCard } from './entities/card.entity';

export const scry = async (game: Game, card: AnyCard, amount: number) => {
  const cards = card.player.cardManager.mainDeck.peek(amount);

  const buckets = await game.interaction.rearrangeCards({
    player: card.player,
    source: card,
    label: `Drag cards to put them at the top or bottom of your deck`,
    buckets: [
      { id: 'top', label: 'Top', cards: cards.slice() },
      { id: 'bottom', label: 'Bottom', cards: [] }
    ]
  });

  buckets.top.reverse().forEach(card => {
    card.player.cardManager.mainDeck.pluck(card);
    card.player.cardManager.mainDeck.addToTop(card);
  });
  buckets.bottom.reverse().forEach(card => {
    card.player.cardManager.mainDeck.pluck(card);
    card.player.cardManager.mainDeck.addToBottom(card);
  });

  return { cards, result: buckets };
};

export const discover = async (game: Game, card: AnyCard, choicePool: AnyCard[]) => {
  const choices: AnyCard[] = [];
  const maxChoices = Math.min(3, choicePool.length);

  for (let i = 0; i < maxChoices; i++) {
    const index = game.rngSystem.nextInt(choicePool.length - 1);
    choices.push(...choicePool.splice(index, 1));
  }
  const [selectedCard] = await game.interaction.chooseCards<AnyCard>({
    player: card.player,
    minChoiceCount: 1,
    maxChoiceCount: 1,
    choices,
    label: 'Choose a card to add to your hand'
  });

  await selectedCard.addToHand();

  return { selectedCard, choices };
};

export const discardFromHand = async (
  game: Game,
  card: AnyCard,
  options: { min: number; max: number }
) => {
  const cards = card.player.cardManager.hand;
  const cardsToDiscard = await game.interaction.chooseCards<AnyCard>({
    player: card.player,
    minChoiceCount: options.min,
    maxChoiceCount: options.max,
    choices: cards,
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

export const getEmpowerStacks = (card: AnyCard) =>
  card.player.hero.modifiers.get(EmpowerModifier)?.stacks ?? 0;
