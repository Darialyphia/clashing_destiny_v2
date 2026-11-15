import type { DeckFactionId } from '@game/engine/src/card/factions/factions';

type PremadeDeck = {
  id: string;
  isGrantedOnAccountCreation: boolean;
  name: string;
  factionId: DeckFactionId;
  mainDeck: Array<{
    blueprintId: string;
    copies: number;
    isFoil: boolean;
  }>;
};

export const premadeDecks: PremadeDeck[] = [];
