import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  anywhereTargetRules,
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  isMinion
} from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import type { CardAfterDestroyEvent } from '../../../card.events';
import type { MinionCard } from '../../../entities/minion.entity';

export const skyBurial: SpellBlueprint = {
  id: 'sky-burial',
  name: 'Sky Burial',
  description: dedent /*html*/ `
  Summon an ally minion that was destroyed this turn in your base exhausted.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/sky-burial'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  manaCost: 4,
  manaSupply: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: false,
  canPlay: (game, card) => {
    const minionHasDiedThisTurn =
      card.player.eventTracker
        .getEventsThisGameTurnByName(GAME_EVENTS.CARD_AFTER_DESTROY)
        .filter(event => {
          const destroyEvent = event.data.event as CardAfterDestroyEvent;

          return destroyEvent.data.card.isAlly(card) && isMinion(destroyEvent.data.card);
        }).length > 0;

    return (
      minionHasDiedThisTurn &&
      emptyBoardSpaceTargetRules.canPlay(
        game,
        space => space.position.zone === CARD_LOCATIONS.BASE
      )
    );
  },
  getTargets: (game, card) =>
    emptyBoardSpaceTargetRules.getTargets({
      game,
      card,
      canCancel: true,
      predicate: space => space.position.zone === CARD_LOCATIONS.BASE
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const space = targets.spaces[0];
    if (!space) return;

    const minionResult = await game.interaction.chooseCards<MinionCard, false>({
      canCancel: false,
      players: {
        [card.player.id]: {
          label: 'Choose a minion to resurrect',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          choices: card.player.eventTracker
            .getEventsThisGameTurnByName(GAME_EVENTS.CARD_AFTER_DESTROY)
            .filter(event => {
              const destroyEvent = event.data.event as CardAfterDestroyEvent;

              return (
                destroyEvent.data.card.isAlly(card) &&
                isMinion(destroyEvent.data.card) &&
                destroyEvent.data.card.location === CARD_LOCATIONS.DISCARD_PILE
              );
            })
            .map(event => {
              return {
                card: (event.data.event as CardAfterDestroyEvent).data.card,
                aiHints: {
                  shouldPick: () => 1
                }
              };
            }),
          timeoutFallback: []
        }
      }
    });

    const minion = minionResult.result[card.player.id].cards[0];
    if (!minion) return;

    await minion.playImmediatelyAt(space, { shouldExhaust: true });
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
