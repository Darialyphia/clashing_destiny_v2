import { assert, isDefined } from '@game/shared';
import { Game, type GameOptions } from '../src/game/game';
import { GAME_EVENTS } from '../src/game/game.events';
import type { Player, PlayerOptions } from '../src/player/player.entity';
import { type GamePhasesDict } from '../src/game/game.enums';
import type { HeroCard } from '../src/card/entities/hero.entity';
import { MinionCard } from '../src/card/entities/minion.entity';
import type { AnyCard } from '../src/card/entities/card.entity';
import type { MinionBlueprint } from '../src/card/card-blueprint';

export const testGameBuilder = () => {
  const options: Partial<GameOptions> = {};

  return {
    withSeed(seed: string) {
      options.rngSeed = seed;
      return this;
    },
    withOverrides(overrides: GameOptions['overrides']) {
      options.overrides = overrides;
      return this;
    },
    withP1Deck(deck: {
      main: PlayerOptions['mainDeck']['cards'];
      destiny: PlayerOptions['destinyDeck']['cards'];
    }) {
      // @ts-expect-error
      options.players ??= [];

      options.players![0] = {
        mainDeck: { cards: deck.main },
        destinyDeck: { cards: deck.destiny },
        id: 'p1',
        name: 'player1'
      };
      return this;
    },
    withP2Deck(deck: {
      main: PlayerOptions['mainDeck']['cards'];
      destiny: PlayerOptions['destinyDeck']['cards'];
    }) {
      // @ts-expect-error
      options.players ??= [];

      options.players![1] = {
        mainDeck: { cards: deck.main },
        destinyDeck: { cards: deck.destiny },
        id: 'p2',
        name: 'player2'
      };
      return this;
    },
    async build(withSnapshots = false) {
      const { players, overrides } = options;
      assert(isDefined(players), 'players must be defined');
      assert(players.length === 2, 'players must have 2 entries');
      const game = new Game({
        id: 'test',
        overrides: overrides ?? {},
        rngSeed: options.rngSeed ?? 'test',
        players,
        enableSnapshots: withSnapshots
      });

      await game.initialize();

      const errors: Error[] = [];

      game.on(GAME_EVENTS.ERROR, event => {
        errors.push(event.data.error);
      });

      return {
        game,
        errors,
        player1: game.playerSystem.player1,
        player2: game.playerSystem.player2,
        testHelpers: {
          generateAndPlayCard: async <T extends AnyCard>(
            player: Player,
            blueprintId: string,
            manaCostIndices: number[]
          ) => {
            const card = await player.generateCard<T>(blueprintId);

            await player.playMainDeckCard(card, manaCostIndices);

            return card;
          },

          async declareAttack({
            attacker,
            target,
            blocker
          }: {
            attacker: MinionCard | HeroCard;
            target: MinionCard | HeroCard;
            blocker?: MinionCard;
          }) {
            await game.gamePhaseSystem.startCombat();
            const { ctx } = game.gamePhaseSystem.getContext<GamePhasesDict['ATTACK']>();

            await ctx.declareAttacker(attacker);
            await ctx.declareAttackTarget(target);
            if (blocker) {
              await ctx.declareBlocker(blocker);
            }
          },

          skipEffectChain: async () => {
            if (!game.effectChainSystem.currentChain) return;

            const player = game.effectChainSystem.currentChain.currentPlayer;
            await game.effectChainSystem.pass(player);
            await game.effectChainSystem.pass(player.opponent);
          },

          async pass() {
            await game.turnSystem.pass(game.activePlayer);
          }
        }
      };
    }
  };
};
