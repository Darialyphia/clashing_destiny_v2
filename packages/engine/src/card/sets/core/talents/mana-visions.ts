import { GAME_EVENTS } from '../../../../game/game.events';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { scry } from '../../../card-actions-utils';
import type { TalentBlueprint } from '../../../card-blueprint';
import { isSpell } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import { mage } from '../heroes/mage';

export const manaVisions: TalentBlueprint = {
  id: 'mana-visions',
  name: 'Mana Visions',
  cardIconId: 'mana-visions',
  description: 'After you play an arcane card, @Scry 1@.',
  affinity: AFFINITIES.ARCANE,
  collectable: true,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  destinyCost: 1,
  level: 1,
  heroId: mage.id,
  rarity: RARITIES.RARE,
  kind: CARD_KINDS.TALENT,
  setId: CARD_SETS.CORE,
  async onInit() {},
  async onPlay(game, card) {
    const modifier = new Modifier<HeroCard>('mana-visions', game, card, {
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_PLAY,
          async handler(event) {
            if (
              !event.data.card.player.equals(card.player) ||
              event.data.card.affinity !== AFFINITIES.ARCANE
            ) {
              return;
            }

            await scry(game, card, 1);
          }
        })
      ]
    });

    await card.player.hero.modifiers.add(modifier);
  }
};
