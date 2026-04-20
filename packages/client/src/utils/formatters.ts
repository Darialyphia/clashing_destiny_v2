export const formatAbilityText = (a: {
  manaCost: number;
  description: string;
}) => `<rt-ability cost="${a.manaCost}"></rt-ability> ${a.description}`;
