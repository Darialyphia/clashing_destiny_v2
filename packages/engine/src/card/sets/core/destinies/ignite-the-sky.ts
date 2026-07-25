import dedent from 'dedent';
import type { DestinyBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import type { DestinyCard } from '../../../entities/destiny.entity';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { fireBolt } from '../spells/fire/fire-bolt';
import { FleetingModifier } from '../../../../modifier/modifiers/fleeting.modifier';

export const igniteTheSky: DestinyBlueprint = {
  id: 'ignite-the-sky',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: 'Ignite the Sky',
  description: dedent /*html*/ `
    When a minion moves to this battlefield, add a <rt-card>Fire Bolt</rt-card> to its owner's hand and give it <rt-keyword>Fleeting</rt-keyword>.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('ignite-the-sky', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_MOVE,
            filter: event =>
              isMinion(event.data.card) && event.data.to.position.zone === card.location,
            async handler(event) {
              const generatedCard = await event.data.card.player.generateCard(
                fireBolt.id,
                event.data.card.isFoil
              );

              await generatedCard.modifiers.add(new FleetingModifier(game, card));
              await generatedCard.addToHand();
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
