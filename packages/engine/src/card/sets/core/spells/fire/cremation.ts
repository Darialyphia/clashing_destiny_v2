import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  JOBS,
  RARITIES
} from '../../../../card.enums';

export const cremation: SpellBlueprint = {
  id: 'cremation',
  name: 'Ceremonial Cremation',
  description: dedent /*html*/ `
  Banish 3 Fire cards from your discard pile. Draw 2 cards.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder-spell'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetarrows: true,
  canPlay: (game, card) =>
    [...card.player.cardManager.discardPile].filter(c =>
      c.affinities.includes(AFFINITIES.FIRE)
    ).length >= 3,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    const choices = [...card.player.cardManager.discardPile].filter(c =>
      c.affinities.includes(AFFINITIES.FIRE)
    );
    const cardsToBanish = await game.interaction.chooseCards({
      player: card.player,
      canCancel: false,
      minChoiceCount: 3,
      maxChoiceCount: 3,
      label: 'Choose 3 Fire cards to banish',
      choices: choices.map(c => ({
        card: c,
        aiHints: {
          shouldPick: () => (card.canPlay() ? 1 : 0.5)
        }
      })),
      timeoutFallback: choices.slice(0, 3)
    });

    for (const cardToBanish of cardsToBanish.result) {
      await cardToBanish.sendToBanishPile();
    }

    await card.player.cardManager.draw(2);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
