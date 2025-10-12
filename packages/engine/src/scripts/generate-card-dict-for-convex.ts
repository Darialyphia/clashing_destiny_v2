import { CARDS_DICTIONARY } from '../card/sets';
import fs from 'fs-extra';
import path from 'path';
import dedent from 'dedent';

const generateCardsFile = () => {
  const cards = Object.fromEntries(
    Object.keys(CARDS_DICTIONARY).map(cardId => [cardId, cardId])
  );
  const collectableCards = Object.fromEntries(
    Object.keys(CARDS_DICTIONARY)
      .filter(cardId => CARDS_DICTIONARY[cardId].collectable)
      .map(cardId => [cardId, cardId])
  );

  const fileContent = dedent`
    /** This file is auto-generated. Do not edit manually.
     * This files export the list of all card ids
     * This file should be used in the api package  to reference card ids
     *  Because referencing the full card dictionary seems to cause some circular dependency issues with convex
     */

  export const cards = ${JSON.stringify(cards, null, 2)} as const;

  export const collectableCards = ${JSON.stringify(collectableCards, null, 2)} as const;
  `;

  const outputPath = path.join(process.cwd(), 'src/generated/cards.ts');
  fs.ensureDirSync(path.dirname(outputPath));
  fs.writeFileSync(outputPath, fileContent);

  console.log(
    `Generated cards.ts with ${cards.length} total cards and ${collectableCards.length} collectable cards`
  );
};

generateCardsFile();
