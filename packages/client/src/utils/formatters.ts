export const formatAbilityText = (a: {
  manaCost: number;
  description: string;
  shouldExhaust: boolean;
}) => {
  return `<rt-ability cost="${a.manaCost}" exhaust="${a.shouldExhaust}"></rt-ability> ${a.description}`;
};
