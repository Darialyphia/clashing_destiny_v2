type PremadeDeck = {
  id: string;
  isGrantedOnAccountCreation: boolean;
  name: string;
  mainDeck: Array<{
    blueprintId: string;
    copies: number;
    isFoil: boolean;
  }>;
  destinyDeck: Array<{
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
