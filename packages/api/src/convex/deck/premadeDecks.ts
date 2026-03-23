type PremadeDeck = {
  id: string;
  isGrantedOnAccountCreation: boolean;
  name: string;
  mainDeck: Array<{
    blueprintId: string;
    copies: number;
    isFoil: boolean;
  }>;
  runeDeck: Array<{
    blueprintId: string;
    copies: number;
    isFoil: boolean;
  }>;
  hero: {
    blueprintId: string;
    isFoil: boolean;
  };
};

export const premadeDecks: PremadeDeck[] = [];
