import type { Game } from '../game/game';
import { GAME_EVENTS } from '../game/game.events';
import { GameEndPhase } from '../game/phases/game-end.phase';
import { SimpleSpellpowerBuffModifier } from '../modifier/modifiers/simple-spellpower.buff.modifier';
import { KEYWORDS } from './card-keywords';
import { isSpell } from './card-utils';
import type { AnyCard } from './entities/card.entity';

export const scry = async (game: Game, card: AnyCard, amount: number) => {
  const cards = card.player.cardManager.mainDeck.peek(amount);
  const cardsToPutAtBottom = await game.interaction.chooseCards<AnyCard>({
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

export const discover = async (game: Game, card: AnyCard, choicePool: AnyCard[]) => {
  const choices: AnyCard[] = [];
  for (let i = 0; i < 3; i++) {
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

export const empower = (game: Game, card: AnyCard, amount: number) => {
  const cleanups = [
    game.on(GAME_EVENTS.CARD_BEFORE_PLAY, async event => {
      if (!event.data.card.player.equals(card.player)) return;
      if (!isSpell(event.data.card)) return;

      await card.player.hero.modifiers.add(
        new SimpleSpellpowerBuffModifier(
          `${KEYWORDS.EMPOWER.id}-${card.id}`,
          game,
          card,
          {
            amount
          }
        )
      );
    }),
    game.on(GAME_EVENTS.CARD_AFTER_PLAY, async event => {
      if (event.data.card.equals(card)) return;
      if (!event.data.card.player.equals(card.player)) return;
      if (!isSpell(event.data.card)) return;
      console.log('clean up');
      await card.player.hero.modifiers.remove(`${KEYWORDS.EMPOWER.id}-${card.id}`);
      cleanups.forEach(cleanup => cleanup());
    }),
    game.on(GAME_EVENTS.TURN_END, async () => {
      console.log('clean up');
      await card.player.hero.modifiers.remove(`${KEYWORDS.EMPOWER.id}-${card.id}`);
      cleanups.forEach(cleanup => cleanup());
    })
  ];
};
