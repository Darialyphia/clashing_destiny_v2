import { sprites } from '@/assets';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARD_KINDS, CARD_SETS } from '@game/engine/src/card/card.enums';
import { CARD_SET_DICTIONARY } from '@game/engine/src/card/sets';
import { shuffle, sample, sampleSize } from 'lodash-es';

export type QuizField =
  | 'name'
  | 'art'
  | 'manaCost'
  | 'manaSupply'
  | 'atk'
  | 'hp'
  | 'commandment'
  | 'silhouette';

export type QuizChoice = {
  id: string;
  label: string;
  // only set for art questions, to render the sprite of the choice
  blueprint?: CardBlueprint;
};

export type QuizQuestion = {
  id: number;
  blueprint: CardBlueprint;
  field: QuizField;
  prompt: string;
  choices: QuizChoice[];
  answerId: string;
};

const PROMPTS: Record<QuizField, string> = {
  name: "What is this card's name?",
  art: 'Which art belongs to this card?',
  manaCost: 'How much mana does this card cost?',
  manaSupply: 'How much mana does this card give when supplied?',
  atk: 'How much attack does this minion have?',
  hp: 'How much health does this minion have?',
  commandment: 'How much influence does this minion have?',
  silhouette: "Who's that minion?"
};

// how likely a question type is to be picked compared to the others
const FIELD_WEIGHTS: Partial<Record<QuizField, number>> = {
  silhouette: 3
};

// the minimum value a stat can have, used to keep the wrong answers plausible
const NUMERIC_FIELDS = {
  manaCost: { min: 0, format: (v: number) => `${v}` },
  manaSupply: { min: 0, format: (v: number) => `+${v}` },
  atk: { min: 0, format: (v: number) => `${v}` },
  hp: { min: 1, format: (v: number) => `${v}` },
  commandment: { min: 0, format: (v: number) => `${v}` }
} as const satisfies Partial<
  Record<QuizField, { min: number; format: (v: number) => string }>
>;
type NumericField = keyof typeof NUMERIC_FIELDS;

const getSprite = (bp: CardBlueprint) =>
  sprites[`cards/${bp.art.default.sprite}`];

const getNumericValue = (bp: CardBlueprint, field: NumericField) => {
  const value =
    field === 'hp' ? (bp as any).maxHp : (bp as Record<string, any>)[field];
  return typeof value === 'number' ? value : null;
};

// runes are left out: there are only a few and they are named after their art
const getPool = () =>
  CARD_SET_DICTIONARY[CARD_SETS.CORE].cards.filter(
    bp => bp.collectable && bp.kind !== CARD_KINDS.RUNE && !!getSprite(bp)
  );

const getAvailableFields = (bp: CardBlueprint, pool: CardBlueprint[]) => {
  const sameKind = pool.filter(other => other.kind === bp.kind);
  const fields: QuizField[] = [];

  if (new Set(sameKind.map(c => c.name)).size >= 3) fields.push('name');
  if (new Set(sameKind.map(c => c.art.default.sprite)).size >= 3) {
    fields.push('art');
    if (bp.kind === CARD_KINDS.MINION) fields.push('silhouette');
  }

  (Object.keys(NUMERIC_FIELDS) as NumericField[]).forEach(field => {
    if (getNumericValue(bp, field) === null) return;
    if (
      bp.kind !== CARD_KINDS.MINION &&
      (field === 'atk' || field === 'hp' || field === 'commandment')
    ) {
      return;
    }
    fields.push(field);
  });

  return fields;
};

const makeNumericChoices = (value: number, field: NumericField) => {
  const { min, format } = NUMERIC_FIELDS[field];
  const wrong = sampleSize(
    [value - 2, value - 1, value + 1, value + 2].filter(v => v >= min),
    2
  );

  return [value, ...wrong].map(v => ({ id: `${v}`, label: format(v) }));
};

const makeCardChoices = (
  bp: CardBlueprint,
  pool: CardBlueprint[],
  field: 'name' | 'art' | 'silhouette'
) => {
  // a wrong answer can't share what the player is shown or picks from,
  // e.g. two minions with the same sprite would make a silhouette ambiguous
  const getKeys = (c: CardBlueprint) =>
    field === 'name'
      ? [`name:${c.name}`]
      : [`name:${c.name}`, `sprite:${c.art.default.sprite}`];

  const seen = new Set(getKeys(bp));
  const wrong: CardBlueprint[] = [];
  for (const candidate of shuffle(
    pool.filter(other => other.kind === bp.kind)
  )) {
    const keys = getKeys(candidate);
    if (keys.some(key => seen.has(key))) continue;
    keys.forEach(key => seen.add(key));
    wrong.push(candidate);
    if (wrong.length === 2) break;
  }

  return [bp, ...wrong].map(c => ({
    id: c.id,
    label: c.name,
    blueprint: field === 'art' ? c : undefined
  }));
};

const pickField = (fields: QuizField[]) => {
  const weighted = fields.flatMap(field =>
    Array.from({ length: FIELD_WEIGHTS[field] ?? 1 }, () => field)
  );
  return sample(weighted)!;
};

export const createCardQuiz = () => {
  const pool = getPool();
  const recentIds: string[] = [];
  let nextId = 0;

  const nextQuestion = (): QuizQuestion => {
    const candidates = pool.filter(bp => !recentIds.includes(bp.id));
    const blueprint = sample(candidates.length ? candidates : pool)!;
    recentIds.push(blueprint.id);
    if (recentIds.length > Math.min(15, pool.length - 1)) recentIds.shift();

    const field = pickField(getAvailableFields(blueprint, pool));
    const choices =
      field === 'name' || field === 'art' || field === 'silhouette'
        ? makeCardChoices(blueprint, pool, field)
        : makeNumericChoices(getNumericValue(blueprint, field)!, field);

    return {
      id: nextId++,
      blueprint,
      field,
      prompt: PROMPTS[field],
      answerId: choices[0].id,
      choices: shuffle(choices)
    };
  };

  return { nextQuestion };
};
