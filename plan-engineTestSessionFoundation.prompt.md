## Plan: Engine Test Session Foundation

Create a typed, deterministic test harness for `@game/engine`: a builder constructs initialized games using the production card pool plus optional per-test blueprints; `TestSession` provides direct state fixtures, typed real-input dispatch, scripted interaction selection, and awaitable full-snapshot predicates. Add full-state snapshot subscription APIs to `Game`, one proving spec, and a separate test type-check configuration so the foundation is executable and type-safe without changing source build output layout.

**Steps**

1. Add full-state snapshot subscriptions to `/home/loic/web/clashing_destiny_v2/packages/engine/src/game/game.ts`.
   - Add omniscient and player-perspective variants whose callbacks receive the existing full `GameStateSnapshot<SerializedOmniscientState>` and `GameStateSnapshot<SerializedPlayerState>` from `GameSnapshotSystem`, not a patch diff.
   - Return the underlying emitter unsubscribe callback from the new methods. Also return that callback from the existing patch-diff `subscribeOmniscient` and `subscribeForPlayer` methods as a backwards-compatible cleanup improvement.
   - Do not duplicate snapshot serialization or modify `GameSnapshotSystem`: its cached full-snapshot getters are the single source of truth.
2. Create `/home/loic/web/clashing_destiny_v2/packages/engine/__test__/helpers/test-session.ts` containing `TestSessionBuilder` and `TestSession`.
   - Builder defaults: stable game id and RNG seed, two conventional test players, empty decks, snapshots enabled, deterministic config suitable for tests (notably no deck shuffling and zero initial hand), while retaining normal game initialization and the production `CARDS_DICTIONARY`.
   - Builder configuration: fluent methods to set either player deck contents, RNG seed, game/config overrides, snapshot behavior, and add a per-test `CardBlueprint` collection. `build()` merges supplied blueprints over the production pool and awaits `game.initialize()` before returning `TestSession`.
   - Keep test controls explicit: setup helpers do not silently advance phases, spend mana, or run card play effects.
3. Implement direct fixture APIs on `TestSession` that operate against initialized engine entities without exercising inputs: resolve `player1`/`player2` by stable ids; retrieve cards by id and blueprint id; add a new production/custom card to a hand; and add a minion directly to a specified owned `BoardSpace` after validating its kind and slot availability. Use `CardSystem.addCard`, `Card.addToHand`, and `BoardSpace.placeCard`; do not use `playAt` for default setup. Include narrowly named accessors for board spaces, hands, cards in play, phase, interaction state/context, current input history, and the latest omniscient full snapshot.
4. Add snapshot waiting and observation helpers to `TestSession`.
   - `subscribeToSnapshot(callback)` delegates to the new full omniscient `Game` subscription and returns its unsubscribe function.
   - `waitForSnapshot(predicate, options?)` evaluates the latest full snapshot synchronously before subscribing, then re-evaluates on each `GAME_EVENTS.NEW_SNAPSHOT`; it resolves with the matching full snapshot and calls the unsubscribe callback exactly once.
   - Options include a finite test-friendly timeout with a diagnostic error, and an explicit policy to reject immediately on an error snapshot unless the predicate itself matched it. The helper must remove its timer and listener on success, timeout, rejection, or session shutdown.
   - No-op dispatches may emit no snapshot, so tests that expect no change must inspect the current snapshot/state directly or use a finite timeout deliberately.
5. Implement a low-level `dispatch(input: SerializedInput)` that forwards exactly to `game.dispatch`/`inputSystem.dispatch`, enabling validity and malformed-payload tests to invoke production validation unmodified. Add typed convenience wrappers for common user actions: declare play, move, pass, declare ability, select board cards, commit card selection, select board spaces, commit space selection, and cancel interaction. Selection wrappers will dispatch one action per id and then a separate commit, preserving actual engine behavior and allowing callers to `waitForSnapshot` between asynchronous interaction states when needed.
6. Add a small assertion-oriented helper only where it reduces repeated unsafe casts, such as `requireCard<TCard>(id)` or `requireCardByBlueprint<TCard>(player, blueprintId)`. It should fail loudly with the current board/hand context rather than return `undefined`. Do not add card-text-specific helpers, phase-skipping helpers, mocks, or a global test-only card set.
7. Create `/home/loic/web/clashing_destiny_v2/packages/engine/tsconfig.test.json` that extends the normal engine TypeScript config, uses a test-compatible root directory, includes `src/**/*.ts` and `__test__/**/*.ts`, and sets `noEmit`. Add a `test:type-check` script in `/home/loic/web/clashing_destiny_v2/packages/engine/package.json` to run it. Keep the existing source `type-check` command unchanged so its output assumptions remain intact.
8. Add `/home/loic/web/clashing_destiny_v2/packages/engine/__test__/helpers/test-session.spec.ts` as a proving spec. It will define a minimal custom production-compatible minion blueprint locally, build a session with that blueprint, directly place one card, await a full snapshot predicate that confirms the expected initialized/interaction state, invoke a real `move` input through the session wrapper, await the resulting full-snapshot condition, and assert the actual board result. This proves builder initialization, custom blueprint merging, fixture placement, typed dispatch, snapshot synchronization, and the configured Vitest discovery path end to end.
9. Write focused documentation comments only for intentional semantic boundaries: direct fixtures bypass lifecycle effects; input wrappers do not; snapshot waiting observes full serialized state and has a finite timeout. Do not modify real card blueprints or gameplay logic beyond the general snapshot subscription APIs.

**Relevant files**

- `/home/loic/web/clashing_destiny_v2/packages/engine/src/game/game.ts` — add full omniscient/player snapshot subscriptions and return unsubscribe functions from all snapshot subscriptions.
- `/home/loic/web/clashing_destiny_v2/packages/engine/__test__/helpers/test-session.ts` — new builder, initialized-session facade, fixtures, input wrappers, interaction scripting, full-snapshot subscription, and awaitable snapshot predicates.
- `/home/loic/web/clashing_destiny_v2/packages/engine/__test__/helpers/test-session.spec.ts` — end-to-end proving coverage for the new harness, including snapshot synchronization.
- `/home/loic/web/clashing_destiny_v2/packages/engine/tsconfig.test.json` — new no-emit type-check configuration for source plus tests.
- `/home/loic/web/clashing_destiny_v2/packages/engine/package.json` — add a dedicated `test:type-check` script.
- `/home/loic/web/clashing_destiny_v2/packages/engine/src/game/systems/game-snapshot.system.ts` — reuse its cached full-snapshot getters; no edit expected.
- `/home/loic/web/clashing_destiny_v2/packages/engine/src/input/input-system.ts` — reuse the `SerializedInput` union and dispatcher; no production edit expected.
- `/home/loic/web/clashing_destiny_v2/packages/engine/src/card/card-blueprint.ts` — use its real blueprint types when accepting per-test custom cards; no production edit expected.

**Verification**

1. Run `npm --workspace @game/engine test -- --run __test__/helpers/test-session.spec.ts` and confirm the proving spec exercises an initialized game, custom card pool, direct setup, an actual input transition, and `waitForSnapshot` both for an already-matching snapshot and a later emitted snapshot.
2. Add focused assertions that full-state subscriptions receive serialized full state while existing patch-diff subscriptions retain their current payloads; verify calling each returned unsubscribe function prevents later callbacks.
3. Run `npm --workspace @game/engine run test:type-check` to type-check both engine source and test utilities with no emit.
4. Run `npm --workspace @game/engine test -- --run` to confirm Vitest discovers and completes the new suite.

**Decisions**

- Test sessions use production cards by default. Tests may inject only the custom `CardBlueprint` entries they require; the builder merges them into the normal card dictionary.
- The initial harness includes interaction scripting for card and space selection, including commit/cancel. It also retains raw dispatch for deliberate invalid-input testing.
- Direct board placement is the default fixture behavior; full play/on-init/on-play flows must be requested explicitly through the real input or card API so fixtures do not obscure behavior under test.
- Test sessions enable snapshots by default because they are the async synchronization mechanism. A builder option can disable them only for tests that neither observe nor await snapshots.
- `waitForSnapshot` checks the latest full snapshot before registering an event listener, has a finite timeout, cleans up in every terminal path, and treats an error snapshot as a failure unless its predicate explicitly accepts it.
- Tests receive a separate no-emit TypeScript config and script because `tsconfig.json` currently includes `__test__` while declaring `rootDir: ./src`, which is incompatible with test files under `__test__`.
- Excluded for now: assertion DSLs, mocked systems, broad phase-navigation helpers, shared test-only card sets, and initial card-effect test suites beyond the proving spec.
