// Headless Chrome driver for the client.
// Reads commands from stdin, one per line, runs them in order against a single page, then closes the browser.
// Usage: node driver.mjs [--base http://localhost:3000] [--out <dir>] [--headed] [--verbose] < script.txt
// See SKILL.md for the command list.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const base = option(
  '--base',
  process.env.CLIENT_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');
const outDir = path.resolve(
  option('--out', path.join(os.tmpdir(), 'run-client', 'shots'))
);
const headed = args.includes('--headed');
const verbose = args.includes('--verbose');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const script = fs
  .readFileSync(0, 'utf8')
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));

// CHROME_PATH wins, otherwise the locally installed Google Chrome
const browser = await chromium.launch({
  headless: !headed,
  ...(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: 'chrome' })
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

const errors = [];
// errors are printed as they happen, under the command that caused them, and listed again by `errors`
const recordError = message => {
  errors.push(message);
  console.log(`  !! ${message}`);
};
page.on('pageerror', err => {
  const where = (err.stack ?? '').split('\n').slice(1, 4).join(' <');
  recordError(`pageerror: ${err.message} ${where}`);
});
// first words of the game loggers' errors, which the client also forwards to console.error
const loggedErrorHeads = [];
page.on('console', msg => {
  if (msg.type() !== 'error') return;
  const text = msg.text();
  if (loggedErrorHeads.some(head => text.startsWith(head))) return;
  recordError(`console: ${text}`);
});

// helpers available to `eval`, `wait-until` and `{{...}}` placeholders
await page.addInitScript(() => {
  // missions expose tutorial(), client() and currentStep(), the sandbox client() and playerId()
  const ctx = () => {
    if (!window.__debug?.tutorial)
      throw new Error(
        'no tutorial on this page (window.__debug.tutorial is missing)'
      );
    return window.__debug.tutorial().ctx;
  };

  // the client and tutorial loggers and the tutorial's step and validation callbacks fill this buffer,
  // the driver prints it after each command
  const logs = [];
  const summarize = value => {
    if (typeof value === 'string') return value;
    if (value instanceof Error)
      return `${value.name}: ${value.message} ${(value.stack ?? '').split('\n').slice(1, 3).join(' <')}`;
    try {
      return JSON.stringify(value)?.slice(0, 300) ?? String(value);
    } catch {
      return `[${value?.constructor?.name ?? typeof value}]`;
    }
  };
  const attached = new WeakSet();
  const attachLoggers = () => {
    const { client, tutorial } = window.__debug ?? {};
    const loggers = [
      ['client', client?.().logger],
      ['tutorial', tutorial?.().logger],
      // a tutorial retry creates a new game, the WeakSet lets the next poll attach to it
      ['game', tutorial?.().ctx.game.logger]
    ];
    for (const [scope, logger] of loggers) {
      if (!logger || attached.has(logger)) continue;
      attached.add(logger);
      const push =
        level =>
        (...args) =>
          logs.push({
            level,
            scope,
            head: summarize(args[0]),
            text: args.map(summarize).join(' ')
          });
      logger.addLogger({
        log: push('log'),
        warn: push('warn'),
        error: push('error'),
        // debug entries carry whole snapshots, the title is enough
        debug: title => logs.push({ level: 'debug', scope, text: title })
      });
    }
    const t = tutorial?.();
    if (t && !attached.has(t)) {
      attached.add(t);
      t.onEnterStep(c =>
        logs.push({
          level: 'step',
          scope: 'tutorial',
          text: `entered step ${c.currentStep?.id}`
        })
      );
      t.onValidation((result, c) => {
        if (result.isValid) return;
        logs.push({
          level: 'warn',
          scope: 'tutorial',
          text: `input rejected by step ${c.currentStep?.id}: ${result.reason ?? '(no reason)'}`
        });
      });
    }
  };
  // window.__debug appears when the page mounts, poll so the first logs are not missed
  setInterval(attachLoggers, 100);
  const drainLogs = () => logs.splice(0);
  const game = () => ctx().game;
  const p1 = () => game().playerSystem.player1;
  const p2 = () => game().playerSystem.player2;
  const hand = (blueprintId, player = p1()) =>
    player.cardManager.hand.find(card => card.blueprintId === blueprintId)?.id;
  const boardSpaces = player => [
    ...player.boardSide.base,
    ...player.boardSide.leftBattlefield.spaces,
    ...player.boardSide.rightBattlefield.spaces
  ];
  const board = (blueprintId, player = p1()) =>
    boardSpaces(player).find(space => space.card?.blueprintId === blueprintId)
      ?.card?.id;
  const card = c => (c ? `${c.blueprintId}#${c.id}` : null);
  const side = player => ({
    mana: player.mana,
    victoryPoints: player.victoryPoints,
    hand: player.cardManager.hand.map(card),
    base: player.boardSide.base.map(space => card(space.card)),
    left: player.boardSide.leftBattlefield.spaces.map(space =>
      card(space.card)
    ),
    right: player.boardSide.rightBattlefield.spaces.map(space =>
      card(space.card)
    ),
    secrets: [
      player.boardSide.leftBattlefield.secretCard,
      player.boardSide.rightBattlefield.secretCard
    ].map(card)
  });
  const state = () => {
    const g = game();
    return {
      step: ctx().currentStep?.id,
      phase: g.gamePhaseSystem.getState(),
      interaction: g.interaction.getState(),
      initiative: g.turnSystem.initiativePlayer.id,
      p1: side(p1()),
      p2: side(p2())
    };
  };
  // the client replays snapshots with animations after the engine is done, inputs sent meanwhile can be dropped
  const isClientSettled = () => {
    const client = ctx().client;
    return (
      !client.isPlayingFx &&
      !client._processingUpdate &&
      client.queue.length === 0 &&
      client.state.turn.initiativePlayer ===
        game().turnSystem.initiativePlayer.id
    );
  };
  window.__drv = {
    ctx,
    game,
    p1,
    p2,
    hand,
    board,
    state,
    isClientSettled,
    drainLogs
  };
});

const evaluate = expression =>
  page.evaluate(expr => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ctx, game, p1, p2, hand, board, state, isClientSettled } =
      window.__drv;
    const result = eval(expr);
    const seen = new WeakSet();
    // game entities are cyclic, keep the output readable
    return JSON.stringify(result, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[cycle]';
        seen.add(value);
      }
      return value;
    });
  }, expression);

// replaces {{expression}} with its value evaluated in the page
const interpolate = async line => {
  let result = line;
  for (const match of line.matchAll(/\{\{(.+?)\}\}/g)) {
    const value = JSON.parse((await evaluate(match[1])) ?? 'null');
    result = result.replace(match[0], value);
  }
  return result;
};

// prints what the game loggers said since the last call: warnings, errors and step changes, logs and debug titles with --verbose
const flushLogs = async () => {
  const entries = await page
    .evaluate(() => window.__drv?.drainLogs() ?? [])
    .catch(() => []);
  for (const { level, scope, head, text } of entries) {
    if ((level === 'debug' || level === 'log') && !verbose) continue;
    if (level === 'error') {
      loggedErrorHeads.push(head);
      if (!errors.some(e => e.startsWith(`console: ${head}`)))
        recordError(`${scope} error: ${text}`);
      continue;
    }
    const prefix = level === 'step' ? '--' : '..';
    console.log(
      `  ${prefix} ${scope} ${level === 'step' ? '' : `${level}: `}${text}`
    );
  }
};

const pollUntil = async (label, expression, timeout) => {
  const start = Date.now();
  while (true) {
    await flushLogs();
    if (JSON.parse((await evaluate(expression)) ?? 'false')) return;
    if (Date.now() - start > timeout)
      throw new Error(`timed out waiting for ${label}`);
    await page.waitForTimeout(150);
  }
};

let shotIndex = 0;
const screenshot = async (name = 'shot') => {
  const file = path.join(
    outDir,
    `${String(shotIndex++).padStart(2, '0')}-${name}.png`
  );
  await page.screenshot({ path: file });
  console.log(`  -> ${file}`);
};

const textBoxText = () =>
  page.evaluate(() =>
    (document.querySelector('.text-box')?.innerText ?? '(no text box)')
      .replace(/\s+/g, ' ')
      .replace(/ Next$/, '')
      .trim()
  );

const nextButton = () => page.locator('.text-box button:has-text("Next")');

// after a drag or hover the mouse rests on a card, and its preview can cover the text box
const clickNext = async () => {
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);
  await nextButton().first().click();
};

const commands = {
  async nav(target) {
    await page.goto(target.startsWith('/') ? base + target : target, {
      waitUntil: 'domcontentloaded'
    });
  },
  async 'wait-for'(selector) {
    await page.waitForSelector(selector, { timeout: 60_000 });
  },
  async wait(ms) {
    await page.waitForTimeout(Number(ms));
  },
  async screenshot(name) {
    await screenshot(name || undefined);
  },
  async click(selector) {
    await page.locator(selector).first().click();
  },
  async hover(selector) {
    await page.locator(selector).first().hover();
  },
  async move(coords) {
    const [x, y] = coords.split(/\s+/).map(Number);
    await page.mouse.move(x, y);
  },
  async drag(selectors) {
    const [from, to] = selectors.split(' -> ');
    // a card preview left open by the previous drag or hover can swallow this one
    await page.mouse.move(5, 5);
    await page.waitForTimeout(300);
    await page.locator(from).first().dragTo(page.locator(to).first());
  },
  async text(selector) {
    console.log(`  ${await page.locator(selector).first().innerText()}`);
  },
  async eval(expression) {
    console.log(`  ${await evaluate(expression)}`);
  },
  async 'wait-until'(expression) {
    await pollUntil(expression, expression, 20_000);
  },
  async state() {
    console.log(`  ${await evaluate('state()')}`);
  },
  async dispatch(json) {
    const input = JSON.parse(json);
    await page.evaluate(i => {
      window.__drv
        .ctx()
        .client.dispatch({ ...i, payload: { playerId: 'p1', ...i.payload } });
    }, input);
  },
  async 'my-turn'() {
    await pollUntil(
      'player 1 to have the initiative',
      `(() => { const s = state(); return s.initiative === 'p1' && s.interaction === 'idle' && s.phase === 'main_phase' && isClientSettled(); })()`,
      30_000
    );
  },
  // for clicks during an interaction (e.g. picking a target), where `my-turn` doesn't apply
  async settled() {
    await pollUntil(
      'the client to finish animating',
      'isClientSettled()',
      30_000
    );
  },
  async textbox() {
    console.log(`  ${await textBoxText()}`);
  },
  async next() {
    await clickNext();
    await page.waitForTimeout(1000);
  },
  // prints and screenshots every text box of the current step, clicking Next until there is none
  async boxes(label = 'box') {
    for (let i = 0; i < 20; i++) {
      // text boxes can be hidden while the opponent has the initiative
      await page.waitForSelector('.text-box', { timeout: 30_000 });
      await page.waitForTimeout(1000);
      console.log(`  [${label} ${i}] ${await textBoxText()}`);
      await screenshot(`${label}-${i}`);
      if ((await nextButton().count()) === 0) return;
      await clickNext();
    }
  },
  async errors() {
    console.log(
      errors.length ? errors.map(e => `  ${e}`).join('\n') : '  (no errors)'
    );
  }
};

let exitCode = 0;
try {
  for (const raw of script) {
    const line = await interpolate(raw);
    const [name, ...rest] = line.split(' ');
    const command = commands[name];
    if (!command) throw new Error(`unknown command: ${name}`);
    console.log(`> ${line}`);
    await command(rest.join(' '));
    await flushLogs();
  }
} catch (err) {
  exitCode = 1;
  await flushLogs();
  console.log(`FAILED: ${err.message.split('\n')[0]}`);
  await screenshot('failure').catch(() => {});
  if (errors.length) console.log(errors.map(e => `  ${e}`).join('\n'));
} finally {
  await browser.close();
}
process.exit(exitCode);
