import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';

const setsDir = path.join(process.cwd(), 'src/card/sets');
const setFileSuffix = '.set.ts';

type CardEntry = {
  identifier: string;
  importPath: string;
  filePath: string;
};

const toPosixPath = (value: string) => value.split(path.sep).join('/');

const listSetNames = async () => {
  const dirents = await fs.readdir(setsDir, { withFileTypes: true });
  return dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
};

const listCardFiles = async (dirPath: string): Promise<string[]> => {
  const dirents = await fs.readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  await Promise.all(
    dirents.map(async dirent => {
      const resolvedPath = path.join(dirPath, dirent.name);
      if (dirent.isDirectory()) {
        files.push(...(await listCardFiles(resolvedPath)));
        return;
      }

      if (!dirent.isFile()) return;
      if (!resolvedPath.endsWith('.ts')) return;
      if (resolvedPath.endsWith(setFileSuffix)) return;
      if (dirent.name === 'index.ts') return;

      files.push(resolvedPath);
    })
  );

  return files.sort();
};

const extractIdentifier = (fileContent: string, filePath: string): string | null => {
  const match = fileContent.match(/export const (\w+)/);
  if (!match) {
    console.warn(`[card-sets] No export const found in ${filePath}`);
    return null;
  }

  return match[1];
};

const buildCardEntries = async (setName: string, setFilePath: string) => {
  const setFolder = path.join(setsDir, setName);
  const cardFiles = await listCardFiles(setFolder);

  const entries: CardEntry[] = [];

  for (const filePath of cardFiles) {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const identifier = extractIdentifier(fileContent, filePath);
    if (!identifier) continue;

    const relativePath = path
      .relative(path.dirname(setFilePath), filePath)
      .replace(/\.ts$/, '');
    const importPath = `./${toPosixPath(relativePath)}`;

    entries.push({ identifier, importPath, filePath });
  }

  const uniqueEntries = new Map<string, CardEntry>();
  for (const entry of entries) {
    if (uniqueEntries.has(entry.identifier)) {
      console.warn(
        `[card-sets] Duplicate export ${entry.identifier} in ${entry.filePath}`
      );
      continue;
    }
    uniqueEntries.set(entry.identifier, entry);
  }

  return Array.from(uniqueEntries.values()).sort((a, b) =>
    a.importPath.localeCompare(b.importPath)
  );
};

const parseExistingImports = (content: string) => {
  const identifiers = new Set<string>();
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"];?/g;
  let match = importRegex.exec(content);

  while (match) {
    match[1]
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
      .forEach(value => identifiers.add(value));
    match = importRegex.exec(content);
  }

  return identifiers;
};

const parseCardsArray = (content: string) => {
  const cardsIndex = content.indexOf('cards: [');
  if (cardsIndex === -1) {
    return {
      arrayContent: null,
      openIndex: -1,
      closeIndex: -1,
      existingCards: [] as string[]
    };
  }

  const openIndex = content.indexOf('[', cardsIndex);
  let depth = 0;
  let closeIndex = -1;

  for (let i = openIndex; i < content.length; i++) {
    const char = content[i];
    if (char === '[') depth++;
    if (char === ']') depth--;
    if (depth === 0) {
      closeIndex = i;
      break;
    }
  }

  if (closeIndex === -1) {
    return {
      arrayContent: null,
      openIndex,
      closeIndex,
      existingCards: [] as string[]
    };
  }

  const arrayContent = content.slice(openIndex + 1, closeIndex);
  const existingCards = arrayContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('//'))
    .map(line => line.replace(/,$/, '').trim())
    .filter(line => /^[A-Za-z_]\w*$/.test(line));

  return { arrayContent, openIndex, closeIndex, existingCards };
};

const getCardsIndent = (content: string, openIndex: number) => {
  const beforeOpen = content.slice(0, openIndex);
  const lastLine = beforeOpen.split('\n').pop() ?? '';
  const indentMatch = lastLine.match(/^(\s*)/);
  const baseIndent = indentMatch ? indentMatch[1] : '';
  return `${baseIndent}  `;
};

const updateCardsArray = (content: string, missingCards: string[]) => {
  if (missingCards.length === 0) return { updatedContent: content, changed: false };

  const { arrayContent, openIndex, closeIndex } = parseCardsArray(content);
  if (arrayContent === null || openIndex === -1 || closeIndex === -1) {
    console.warn('[card-sets] Could not locate cards array.');
    return { updatedContent: content, changed: false };
  }

  const arrayLines = arrayContent.split('\n');
  let lastNonEmptyIndex = -1;

  for (let i = arrayLines.length - 1; i >= 0; i--) {
    if (arrayLines[i].trim()) {
      lastNonEmptyIndex = i;
      break;
    }
  }

  const trailingLines =
    lastNonEmptyIndex >= 0 ? arrayLines.slice(lastNonEmptyIndex + 1) : [];
  const baseLines =
    lastNonEmptyIndex >= 0 ? arrayLines.slice(0, lastNonEmptyIndex + 1) : [];

  if (baseLines.length > 0) {
    const lastLine = baseLines[baseLines.length - 1];
    if (!lastLine.trim().endsWith(',')) {
      baseLines[baseLines.length - 1] = `${lastLine.trimEnd()},`;
    }
  }

  const indent = getCardsIndent(content, openIndex);
  missingCards.forEach((cardId, index) => {
    const isLast = index === missingCards.length - 1;
    baseLines.push(`${indent}${cardId}${isLast ? '' : ','}`);
  });

  const newArrayContent = [...baseLines, ...trailingLines].join('\n');
  const updatedContent =
    content.slice(0, openIndex + 1) + newArrayContent + content.slice(closeIndex);

  return { updatedContent, changed: updatedContent !== content };
};

const insertMissingImports = (content: string, missingImports: CardEntry[]) => {
  if (missingImports.length === 0) return { updatedContent: content, changed: false };

  const lines = content.split('\n');
  let lastImportIndex = -1;

  lines.forEach((line, index) => {
    if (line.startsWith('import ')) {
      lastImportIndex = index;
    }
  });

  if (lastImportIndex === -1) {
    console.warn('[card-sets] No imports found to insert after.');
    return { updatedContent: content, changed: false };
  }

  const importLines = missingImports.map(
    entry => `import { ${entry.identifier} } from '${entry.importPath}';`
  );

  lines.splice(lastImportIndex + 1, 0, ...importLines);
  const updatedContent = lines.join('\n');

  return { updatedContent, changed: updatedContent !== content };
};

const updateSetFile = async (setName: string) => {
  const setFilePath = path.join(setsDir, `${setName}${setFileSuffix}`);

  if (!(await fs.pathExists(setFilePath))) {
    console.warn(`[card-sets] Set file missing: ${setFilePath}`);
    return false;
  }

  const cardEntries = await buildCardEntries(setName, setFilePath);
  const content = await fs.readFile(setFilePath, 'utf8');

  const existingImports = parseExistingImports(content);
  const { existingCards } = parseCardsArray(content);

  const missingCards = cardEntries
    .map(entry => entry.identifier)
    .filter(identifier => !existingCards.includes(identifier));
  const missingImports = cardEntries.filter(
    entry => !existingImports.has(entry.identifier)
  );

  let updatedContent = content;
  let changed = false;

  const importUpdate = insertMissingImports(updatedContent, missingImports);
  if (importUpdate.changed) {
    updatedContent = importUpdate.updatedContent;
    changed = true;
  }

  const cardsUpdate = updateCardsArray(updatedContent, missingCards);
  if (cardsUpdate.changed) {
    updatedContent = cardsUpdate.updatedContent;
    changed = true;
  }

  if (changed) {
    await fs.writeFile(setFilePath, updatedContent);
    console.log(`[card-sets] Updated ${setName} set.`);
  }

  return changed;
};

const updateAllSets = async () => {
  const setNames = await listSetNames();
  const results = await Promise.all(setNames.map(setName => updateSetFile(setName)));
  return results.some(Boolean);
};

const runGenerateCards = async () => {
  console.log('[card-sets] Running generate-cards...');
  await new Promise<void>((resolve, reject) => {
    const child = spawn('npm', ['run', 'generate-cards'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`[card-sets] generate-cards exited with code ${code}`));
      }
    });
  });
};

const runOnce = async () => {
  const changed = await updateAllSets();
  if (changed) {
    await runGenerateCards();
  }
};

const startWatcher = async () => {
  await runOnce();

  const watcher = chokidar.watch(path.join(setsDir, '**/*.ts'), {
    ignoreInitial: true,
    ignored: [new RegExp(`${setFileSuffix.replace('.', '\\.')}$`), /\/index\.ts$/]
  });

  let scheduled: NodeJS.Timeout | undefined;
  let isRunning = false;
  let hasPending = false;

  const scheduleUpdate = () => {
    hasPending = true;
    if (scheduled) clearTimeout(scheduled);
    scheduled = setTimeout(async () => {
      scheduled = undefined;
      if (isRunning) return;

      isRunning = true;
      hasPending = false;

      try {
        await runOnce();
      } catch (error) {
        console.error(error);
      } finally {
        isRunning = false;
        if (hasPending) scheduleUpdate();
      }
    }, 200);
  };

  watcher.on('add', scheduleUpdate);
  watcher.on('change', scheduleUpdate);
  watcher.on('unlink', scheduleUpdate);

  console.log('[card-sets] Watching for card changes...');
};

const main = async () => {
  const args = new Set(process.argv.slice(2));
  if (args.has('--once')) {
    await runOnce();
    return;
  }

  await startWatcher();
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
