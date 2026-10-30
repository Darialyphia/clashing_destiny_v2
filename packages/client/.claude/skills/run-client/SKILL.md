---
name: run-client
description: Run, drive, screenshot and test the game client (Vue + Vite) and its tutorial missions. Use when asked to start the client, open or play a tutorial mission, take a screenshot of the game board, check that a card or mission works in the real UI, or simulate a mission in the engine without a browser.
---

The client is a Vite dev server. An agent drives it with `.claude/skills/run-client/driver.mjs`, a headless Chrome (Playwright) that reads commands from stdin and saves screenshots. Without a login, the playable surface is the tutorial missions at `/missions/<id>`: they run the full engine and game board in the page, with no backend. Mission logic can also be simulated in the engine with vitest, in seconds.

All paths are relative to `packages/client/`. Verified on Windows 11 in Git Bash, Node 22.18, npm 10.9, with Google Chrome installed and the repo's root `node_modules` already installed.

## Setup (once)

The driver's only dependency is `playwright-core`, installed inside the skill folder (outside the npm workspaces, the root lockfile is untouched). Run `npm install` from inside the folder, not with `--prefix` (see Troubleshooting):

```bash
(cd .claude/skills/run-client && npm install --no-audit --no-fund)
```

The driver launches the installed Google Chrome (`channel: 'chrome'`). To use another Chromium binary, set `CHROME_PATH`, e.g. `CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"`.

## Dev server

The user usually has one running on port 3000. Check before starting another:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```

`200` means use it as is. Otherwise, start your own on 3100 so it never fights with theirs, and poll until it serves:

```bash
(npm run dev -- --port 3100 --strictPort > "$TEMP/run-client-vite.log" 2>&1 &)
timeout 120 bash -c 'until curl -sf http://localhost:3100 >/dev/null; do sleep 1; done'
```

Then pass `--base http://localhost:3100` to the driver. Stop it by killing whatever listens on 3100 (never on 3000, that's the user's):

```bash
netstat -ano | grep -E ":3100 .*LISTENING" | awk '{print $5}' | sort -u | xargs -r -I{} taskkill //F //T //PID {}
```

## Drive (agent path)

```bash
node .claude/skills/run-client/driver.mjs <<'EOF'
nav /missions/artifacts-secrets
wait-for .text-box
boxes intro
drag #hand-p1 [id="{{hand('tutorial-windblade-adept')}}"] -> #supply-zone-p1
my-turn
state
screenshot after-supply
errors
EOF
```

Each command is echoed, followed by what the game said meanwhile: `-- tutorial entered step N`, `.. tutorial warn: input rejected by step N: <reason>`, client and engine warnings such as `.. client warn: Already processing updates...` or `.. game warn: [InputSystem]: unknown input type ...`, and `!!` errors. Screenshots print their absolute path: `<out>/NN-<name>.png`, by default `$TEMP/run-client/shots/` (wiped at every run). **Open the screenshots and look at them.** The first failing command prints `FAILED: ...`, saves a `failure` screenshot and exits with code 1. One run is one fresh page: missions restart from step 0 each time.

Options: `--base <url>` (default `http://localhost:3000`, or `CLIENT_URL`), `--out <dir>`, `--headed`, `--verbose` (also prints log lines and debug titles, e.g. `.. game debug: [InputSystem]: move`, `.. client debug: Snapshot Update: 9`).

| command                                 | what it does                                                                                                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nav <path or url>`                     | open a page, paths are relative to `--base`                                                                                                                            |
| `wait-for <selector>`                   | wait up to 60s for an element                                                                                                                                          |
| `wait <ms>`                             | sleep                                                                                                                                                                  |
| `screenshot [name]`                     | full page screenshot                                                                                                                                                   |
| `click <selector>` / `hover <selector>` | real mouse click / hover on the first match                                                                                                                            |
| `drag <from selector> -> <to selector>` | real mouse drag: a card from hand to a board space or the supply zone, a minion onto an enemy (attack), onto a space (move) or onto its battlefield's Location (score) |
| `move <x> <y>`                          | move the mouse, e.g. to stop hovering a card                                                                                                                           |
| `text <selector>`                       | print an element's text                                                                                                                                                |
| `textbox`                               | print the tutorial text box                                                                                                                                            |
| `next`                                  | click the text box's Next button                                                                                                                                       |
| `boxes [label]`                         | print and screenshot every text box of the current step, clicking Next until there is none                                                                             |
| `state`                                 | engine state: step, phase, interaction, initiative, mana, VP, hand and board of both players                                                                           |
| `dispatch <json>`                       | send an input like the UI does, through the tutorial step's validation; `playerId` defaults to `p1`                                                                    |
| `wait-until <js>`                       | poll a JS expression until it is truthy (20s)                                                                                                                          |
| `settled`                               | wait until the client has finished animating (30s). Use it before clicking during an interaction, e.g. picking a target, where `my-turn` doesn't apply                 |
| `my-turn`                               | wait until player 1 has the initiative, idle, in the main phase, and the client has finished animating (30s). Use it before every UI action                            |
| `eval <js>`                             | print the JSON value of a JS expression                                                                                                                                |
| `errors`                                | print the page errors, console errors and game logger errors seen so far (they are also printed as `!!` lines with a stack excerpt when they happen)                   |

`{{js}}` anywhere in a line is replaced by its value in the page, and `eval` / `wait-until` / `{{}}` can use these helpers: `ctx()` (tutorial context: `game`, `client`, `meta`, `currentStep`), `game()`, `p1()`, `p2()`, `hand(blueprintId, player = p1())` and `board(blueprintId, player = p1())` (card id or undefined), `state()`, `isClientSettled()`, and the page's own `window.__debug` (`tutorial()`, `client()`, `currentStep()`).

Things you need to write scripts:

- **Mission ids**: `basics`, `resources`, `artifacts-secrets`, `locations`, from `src/pages/missions/index.ts`.
- **Card ids** are deterministic, `<blueprintId>-<n>` (e.g. `bloodbound-shaman-7`). **Space ids** look like `p1-base-0`.
- **Selectors** (from `DOMSelectors` in `packages/engine/src/client/controllers/ui-controller.ts`): card in hand `#hand-p1 [id="<cardId>"]`, card on board `#board [id="<cardId>"]`, board space `#board-space-<spaceId>`, supply zone `#supply-zone-p1`, tutorial text box `.text-box`. Card ids contain dashes, so use `[id="..."]` rather than `#id`.
- **Engine state names**: phases `main_phase`, `play_card_phase`, `game_end`; interactions `idle`, `select_space_on_board`, `selecting_cards_on_board`, `choosing_cards`.
- **Inputs**: playing a card is `declarePlayCard {id}`, then `supplyCard {}` (in `play_card_phase`) or `selectSpaceOnBoard {id}`, then `selectCardOnBoard {cardId}` for targets. Also `move {cardId, zone, index}` (zones `left_battlefield`, `right_battlefield`), `score {minionId}`, `pass {}`, `chooseCards {indices}` (affinity choice), `declareUseCardAbility {cardId, abilityId}`.

A real UI step, verified: supply by drag, play a minion by drag, pick its On Enter target by click.

```bash
node .claude/skills/run-client/driver.mjs <<'EOF'
nav /missions/artifacts-secrets
wait-for .text-box
boxes intro
drag #hand-p1 [id="{{hand('tutorial-windblade-adept')}}"] -> #supply-zone-p1
my-turn
drag #hand-p1 [id="{{hand('tutorial-sunstone-templar')}}"] -> #board-space-{{p1().boardSide.base[0].id}}
wait-until game().interaction.getState() === 'selecting_cards_on_board'
settled
screenshot on-enter-target
click #board [id="{{board('bloodbound-shaman', p2())}}"]
wait-until ctx().currentStep.id === 1
textbox
errors
EOF
```

## Simulate a mission in the engine (no browser)

`mission-sim.spec.ts` starts missions in the engine with a fake client. It checks that every mission reaches step 0 without errors, and has a scripted example step to copy. Vitest only picks up `packages/engine/__test__/`, so copy it there, run it, remove it:

```bash
cp .claude/skills/run-client/mission-sim.spec.ts ../engine/__test__/mission-sim.spec.ts
(cd ../engine && npx vitest run __test__/mission-sim.spec.ts --silent)
rm ../engine/__test__/mission-sim.spec.ts
```

4 tests pass in about 3s. `--silent` hides the engine's log of every input.

## Checks

```bash
npm run type-check                          # vue-tsc, ~45s
(cd ../engine && npm run type-check)        # tsc
(cd ../engine && npx vitest run --silent)   # engine tests
```

On `dev`, 3 engine tests already fail (`test-session.spec.ts` x2, `tutorial.spec.ts` "resets to an authored checkpoint", with `Cannot read properties of undefined`). Anything beyond those is yours.

## Run (human path)

`npm run dev`, then open `http://localhost:3000/missions/basics` in a browser. Ctrl-C to stop.

## Gotchas

- **Without a login only the public routes work**: `/`, `/missions/:id`, `/rules`, `/login`, `/register`, `/foil-visualizer`. Everything under `/client/*` (sandbox, collection, lobby...) needs a Convex session (`clashing-destiny-session-id` in localStorage). Opening one directly gives a **blank white page with no console error and no redirect**. The sandbox loads its decks from Convex, so it can't be faked locally. Use a mission to see cards on a board.
- **Missions expose `window.__debug`** (`tutorial()`, `client()`, `currentStep()`; the sandbox has `client()` and `playerId()`). The driver attaches its own consumer to `client().logger`, `tutorial().logger` and `tutorial().ctx.game.logger` with `logger.addLogger()` (again after a retry, which creates a new game), and hooks `tutorial().onEnterStep` / `onValidation`, which is where the step and rejection lines come from. A rejected UI input only shows up there, the UI flashes the reason for 3s.
- **The screen lags the engine.** `state` and `wait-until` read the engine. The screen shows the client, which replays snapshots with animations, so it can show the previous state for 1 to 3s. **A drag or click made while the client is still animating is silently dropped**: the engine already says it's your turn, nothing happens, and the next `wait-until` times out. `my-turn` also waits for the client (`isClientSettled()`: no animation, empty snapshot queue, same initiative as the engine), so put it before every UI action. During an interaction (picking a target after playing a card) use `settled` instead: the click on the target is dropped just the same.
- **Card previews get in the way.** After a drag or hover the mouse rests on a card, and its preview can cover the text box's Next button or swallow the next drag. `drag`, `next` and `boxes` move the mouse to the corner first; after `hover`, use `move 5 5` before clicking anything else.
- **Scoring by drag**: drag the minion onto the Location card of its battlefield (`#board [id="<locationId>"]`). Location ids are on `p1().boardSide.leftBattlefield.destinyCard` or the same field of `p2()`, depending on who brought it (destiny is the code name for Locations).
- **Only the first text box's `onEnter` runs when a step starts**, the others run when Next is clicked. Missions often trigger scripted opponent moves from those, so click through with `boxes` (it waits up to 30s for a box, since boxes can hide during the opponent's turn). The engine simulation only runs the first one, call the others yourself if a step needs them.
- **Artifact abilities** are a hover-only button under the board card with no DOM id. `hover` the card to screenshot it, `dispatch` `declareUseCardAbility` to use it.
- **Cold start**: the first page on a fresh Vite server takes about 30s (on-demand compile). `wait-for` allows 60s.
- **`npm run lint` lints this folder too** (`eslint . --fix`). Keep `driver.mjs` and `mission-sim.spec.ts` lint-clean.
- **New card files** must be registered in their set and in `packages/engine/src/generated/cards.ts`. The engine's `dev` watcher does it on file creation (it is part of the root `npm run dev`); without it, a new card doesn't exist in the game.

## Troubleshooting

- **`!! pageerror: Cannot read properties of null (reading 'id') at cardOnBoardElement` when a turn ends**: a mission's gesture or highlight looked up a Location while they rotate. At the start of each turn a battlefield briefly has no Location, so return `null` instead (see `getLocationElement` in `src/pages/missions/locations.ts`).
- **`npm install --prefix .claude/skills/run-client` adds `"client": "file:../../.."` to the skill's `package.json`** and links `packages/client` into its `node_modules`: run from `packages/client`, npm also installs the current package. Restore `package.json` (only `playwright-core`), delete `node_modules` and `package-lock.json` in the skill folder, and reinstall from inside it.
- **`FAILED: no tutorial on this page (window.__debug.tutorial is missing)`**: a helper ran before the mission mounted, or on a non-mission page. `wait-for .text-box` first.
- **`FAILED: timed out waiting for ...`**: open the `failure` screenshot and add a `state` before the wait. Usual causes: a wrong state name (it's `select_space_on_board`, not `selecting_space_on_board`), or the tutorial step rejected the input (its validation only accepts the scripted action).
- **Scripted opponent moves happen in the simulation but never in the browser at the start of a turn**: the client skips snapshots without changes, so `onUpdateCompleted` never fires. Use `dispatchSequence(ctx, sequence, { immediate: true })` from `src/pages/client/tutorial/tutorial-utils.ts`.
- **A minion destroyed during its own move stays displayed on its destination space**: client bug, the move animation writes the card into the cell and the diff doesn't remove it. In missions, trigger effects on attack rather than on move.
