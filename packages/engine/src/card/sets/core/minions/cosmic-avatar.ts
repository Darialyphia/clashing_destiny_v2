import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { PiercingModifier } from '../../../../modifier/modifiers/percing.modifier';
import { OverwhelmModifier } from '../../../../modifier/modifiers/overwhelm.modifier';
import { OnHitModifier } from '../../../../modifier/modifiers/on-hit.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { MinionCard } from '../../../entities/minion.entity';

export const cosmicAvatar: MinionBlueprint = {
  id: 'cosmic-avatar',
  name: 'Cosmic Avatar',
  cardIconId: 'minions/cosmic-avatar',
  description: dedent`
  @Piercing@, @Overwhelm@.
  @On Hero Hit@ : add that many @Mana Spark@ to your hand.
  `,
  collectable: true,
  unique: false,
  destinyCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 4,
  maxHp: 5,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new PiercingModifier(game, card));
    await card.modifiers.add(new OverwhelmModifier(game, card));
    await card.modifiers.add(
      // we cant use the OnHtModifier because it only triggers when the unit actually attacks the target
      new Modifier<MinionCard>('cosmic-avatar-on-hit', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE,
            handler: async event => {
              if (event.data.card.equals(card.player.hero)) return;
              if (event.data.source.equals(card)) {
                const amount = event.data.damage.getFinalAmount(card.player.hero);
                for (let i = 0; i < amount; i++) {
                  const manaSpark = await card.player.generateCard('mana-spark');
                  await manaSpark.addToHand();
                }
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
