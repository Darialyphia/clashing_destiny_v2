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
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { DestinyCard } from '../../../entities/destiny.entity';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { isDefined } from '@game/shared';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';


export const restrainTheBeast: DestinyBlueprint = {
  id: 'restrain-the-beast',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: 'Restrain the Beast',
  description: dedent /*html*/ `
    When a creature with 4 Attack or more moves to this battlefield, exhaust it.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('restrain-the-beast', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_MOVE,
            filter(event) {
              return !!(
                isMinion(event.data.card) &&
                event.data.card.atk >= 4 &&
                event.data.to.position.zone === card.battlefield?.zone
              );
            },
            async handler(event) {
              await event.data.card.exhaust();
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
