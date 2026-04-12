type PremadeDeck = {
  id: string;
  isGrantedOnAccountCreation: boolean;
  name: string;
  mainDeck: Array<{
    blueprintId: string;
    copies: number;
    isFoil: boolean;
  }>;
};

export const premadeDecks: PremadeDeck[] = [];
