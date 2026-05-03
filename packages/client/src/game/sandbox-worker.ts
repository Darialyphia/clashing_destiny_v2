/// <reference lib="webworker" />
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { match } from 'ts-pattern';
import type { AnyCard } from '@game/engine/src/card/entities/card.entity';

type SandboxWorkerEvent =
  | {
      type: 'init';
      payload: {
        options: Pick<GameOptions, 'players' | 'rngSeed'>;
      };
    }
  | { type: 'dispatch'; payload: { input: SerializedInput } }
  | { type: 'debug' }
  | { type: 'rewind'; payload: { step: number } }
  | {
      type: 'addCardtoHand';
      payload: { blueprintId: string; playerId: string };
    }
  | {
      type: 'addCardToTopOfDeck';
      payload: { blueprintId: string; playerId: string };
    }
  | {
      type: 'addCardToDiscardPile';
      payload: { blueprintId: string; playerId: string };
    }
  | {
      type: 'draw';
      payload: { playerId: string };
    }
  | { type: 'refillMana'; payload: { playerId: string } }
  | { type: 'grantExp'; payload: { playerId: string; amount: number } };

let game: Game;
self.addEventListener('message', ({ data }) => {
  const options = data as SandboxWorkerEvent;

  match(options)
    .with({ type: 'debug' }, () => {
      console.log(game);
    })
    .with({ type: 'init' }, async ({ payload }) => {
      game = new Game({
        id: 'sandbox',
        rngSeed: payload.options.rngSeed,
        history: [],
        overrides: {
          cardPool: CARDS_DICTIONARY
        },
        players: payload.options.players,
        enableSnapshots: true
      });

      await game.initialize();
      self.postMessage({
        type: 'ready',
        payload: {
          snapshot: game.snapshotSystem.getLatestOmniscientSnapshot()
        }
      });
      game.subscribeOmniscient(snapshot => {
        // helper to find malformed events that would break structuredClone
        snapshot.events.forEach(event => {
          try {
            JSON.stringify(event);
          } catch {
            console.error('Error stringifying event:', event.eventName, event);
          }
        });

        self.postMessage({
          type: 'update',
          payload: snapshot
        });
      });
    })
    .with({ type: 'dispatch' }, async ({ payload }) => {
      game.dispatch(payload.input);
    })
    .with({ type: 'rewind' }, async ({ payload }) => {
      if (!game) {
        console.warn('Game not initialized yet, cannot rewind');
      }
      const history = game.inputSystem.serialize().slice(0, payload.step + 1);
      game = new Game({ ...game.options, history });

      await game.initialize();
      self.postMessage({
        type: 'ready',
        payload: {
          snapshot: game.snapshotSystem.getLatestOmniscientSnapshot(),
          history: game.inputSystem.serialize()
        }
      });

      game.subscribeOmniscient(snapshot => {
        // helper to find malformed events that would break structuredClone
        snapshot.events.forEach(event => {
          try {
            JSON.stringify(event);
          } catch {
            console.error('Error stringifying event:', event.eventName, event);
          }
        });

        self.postMessage({
          type: 'update',
          payload: snapshot
        });
      });
    })
    .with({ type: 'addCardtoHand' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      const card = await player.generateCard(payload.blueprintId, false);
      await card.addToHand();
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'addCardToTopOfDeck' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      const card = await player.generateCard<AnyCard>(
        payload.blueprintId,
        false
      );
      player.cardManager.mainDeck.addToTop(card);
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'addCardToDiscardPile' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      const card = await player.generateCard(payload.blueprintId, false);
      await card.sendToDiscardPile();
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'refillMana' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      player.manaManager.refill();
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'draw' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      await player.cardManager.draw(1);
      game.snapshotSystem.takeSnapshot();
    })
    .with({ type: 'grantExp' }, async ({ payload }) => {
      const player = game.playerSystem.getPlayerById(payload.playerId)!;
      await player.levelManager.gainExp(payload.amount);
      game.snapshotSystem.takeSnapshot();
    })
    .exhaustive();
});
