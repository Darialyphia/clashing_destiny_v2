import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { scry } from '../../../card-actions-utils';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import { InterceptModifier } from '../../../../modifier/modifiers/intercept.modifier';
import { HeroInterceptModifier } from '../../../../modifier/modifiers/hero-intercept.modifier';

export const ceruleanWaveDisciple: MinionBlueprint = {
  id: 'cerulean-wave-disciple',
  name: 'Cerulean Wave Disciple',
  cardIconId: 'minions/cerulean-wave-disciple',
  description: dedent`@Hero Intercept@.
  @On Death@: Draw a card.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new HeroInterceptModifier(game, card, {}));

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {
          await card.player.cardManager.draw(1);
        }
      })
    );
  },
  async onPlay() {}
};
