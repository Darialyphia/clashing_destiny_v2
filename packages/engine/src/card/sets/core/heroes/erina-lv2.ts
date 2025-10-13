import dedent from 'dedent';
import type { HeroBlueprint } from '../../../card-blueprint';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { isSpell } from '../../../card-utils';
import { GAME_EVENTS } from '../../../../game/game.events';

export const erinaLv2: HeroBlueprint = {
  id: 'erina-lv2',
  name: 'Erina, Aether Scholar',
  description: dedent`
  @Erina Lineage@.
  @On Enter@: this turn, when you play a spell, add a @Mana Spark@ to your hand.
  `,
  cardIconId: 'heroes/erina-lv2',
  kind: CARD_KINDS.HERO,
  level: 2,
  destinyCost: 2,
  speed: CARD_SPEED.SLOW,
  jobs: [HERO_JOBS.MAGE],
  spellSchools: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: 'erina',
  spellPower: 0,
  atk: 0,
  maxHp: 20,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'erina-lv2-ability',
      canUse(game, card) {
        return card.location === 'board';
      },
      description: dedent`@[mana] 2@@[exhaust]@ : Draw a card in your Destiny Zone.`,
      getPreResponseTargets: async () => [],
      label: '@[mana] 2@@[exhaust]@ : Draw a card in your Destiny Zone.',
      manaCost: 2,
      shouldExhaust: true,
      speed: CARD_SPEED.SLOW,
      async onResolve(game, card) {
        await card.player.cardManager.drawIntoDestinyZone(1);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const stop = game.on(GAME_EVENTS.CARD_AFTER_PLAY, async event => {
            if (event.data.card.isAlly(card) && isSpell(event.data.card)) {
              const manaSpark = await card.player.generateCard('mana-spark');
              await manaSpark.addToHand();
            }
          });

          game.once(GAME_EVENTS.TURN_END, () => {
            stop();
          });
        }
      })
    );
  },
  async onPlay() {}
};
