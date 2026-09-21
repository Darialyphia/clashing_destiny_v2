import dedent from 'dedent';
import type { DestinyBlueprint } from '../../../card-blueprint';
import type { SecretCard } from '../../../entities/secret.entity';
import { defaultCardArt, isSecret } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import type { DestinyCard } from '../../../entities/destiny.entity';

export const theAmberPass: DestinyBlueprint = {
  id: 'the-amber-pass',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: 'The Amber Pass',
  description: dedent /*html*/ `
  When a secret is revealed at this battlefield, its owner gains 1 influence here.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  art: defaultCardArt('destinies/amber-pass'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<DestinyCard>('the-amber-pass', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_EFFECT_TRIGGERED,
            filter: event =>
              isSecret(event.data.card) && event.data.card.location === card.location,
            async handler(event) {
              await (event.data.card as SecretCard).battlefield?.gainScore(1);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
