import type { Point } from '../types/geometry';
import type { AnyObject, Entries } from '../types/utils';

export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const random = (max: number) => Math.random() * max;

export const randomInt = (max: number) => Math.round(random(max));

export const indexToPoint = (length: number, idx: number): Point => ({
  x: idx % length,
  y: Math.floor(idx / length)
});

export const pointToIndex = ({ x, y }: Point, width: number) => width * y + x;

type UnionToIntersection<T> = (T extends T ? (p: T) => void : never) extends (
  p: infer U
) => void
  ? U
  : never;
type FromEntries<T extends readonly [PropertyKey, any]> = T extends T
  ? Record<T[0], T[1]>
  : never;
// eslint-disable-next-line @typescript-eslint/ban-types
type Flatten<T> = {} & {
  [P in keyof T]: T[P];
};

export function fromEntries<
  V extends PropertyKey,
  T extends [readonly [V, any]] | Array<readonly [V, any]>
>(entries: T): Flatten<UnionToIntersection<FromEntries<T[number]>>> {
  return Object.fromEntries(entries) as any;
}

export const objectEntries = <T extends AnyObject>(obj: T) =>
  Object.entries(obj) as Entries<T>;

export const objectKeys = <T extends AnyObject>(obj: T) =>
  Object.keys(obj) as unknown as (keyof T)[];

export const padArray = <T>(arr: T[], len: number, fill: T) => {
  return arr.concat(Array(len).fill(fill)).slice(0, len);
};

export const shuffleArray = <T>(array: T[], rng: () => number) => {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result;
};

export const waitFor = (ms: number) => {
  return new Promise<void>(res => {
    setTimeout(res, ms);
  });
};

export const randomString = (length: number) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const uppercaseFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
