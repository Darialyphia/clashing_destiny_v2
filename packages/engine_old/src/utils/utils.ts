export const areArraysIdentical = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
};

export function generateRandomString(length: number): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';

  let str = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    str += alphabet[randomIndex];
  }
  return str;
}
