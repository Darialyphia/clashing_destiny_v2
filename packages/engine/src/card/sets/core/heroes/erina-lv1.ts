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
import { EchoModifier } from '../../../../modifier/modifiers/echo.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { isSpell } from '../../../card-utils';

export const erinaLv1: HeroBlueprint = {
  id: 'erina-lv1',
  name: 'Erina, Council Mage',
  description: dedent`@On Enter@: Draw a card. If it's a Spell, it gains @Echo@.`,
  cardIconId: 'heroes/erina-lv1',
  kind: CARD_KINDS.HERO,
  level: 1,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  jobs: [HERO_JOBS.MAGE],
  spellSchools: [SPELL_SCHOOLS.ARCANE, SPELL_SCHOOLS.WATER],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: 'erina',
  spellPower: 0,
  atk: 0,
  maxHp: 16,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const [drawnCard] = await card.player.cardManager.draw(1);
          if (drawnCard && isSpell(drawnCard)) {
            await drawnCard.modifiers.add(new EchoModifier(game, card));
          }
        }
      })
    );
  },
  async onPlay() {}
};
