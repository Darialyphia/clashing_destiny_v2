import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { isMinion, singleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { HeroCard } from '../../../entities/hero.entity';

export const channelTheFlames: SpellBlueprint = {
  id: 'channel-the-flames',
  name: 'Channel the Flames',
  cardIconId: 'spells/channel-the-flames',
  description: 'Give your Hero: @On Level Up@: Take 3 damage and draw a card.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.FIRE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('channel-the-flames', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.HERO_AFTER_LEVEL_UP,
            handler: async event => {
              if (event.data.to.player.equals(card.player)) {
                await event.data.to.takeDamage(card, new SpellDamage(3, card));
                await card.player.cardManager.draw(1);
              }
            }
          })
        ]
      })
    );
  }
};
