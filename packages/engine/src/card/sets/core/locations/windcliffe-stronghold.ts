import dedent from 'dedent';
import type { LocationBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import type { LocationCard } from '../../../entities/location.entity';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { ShieldModifier } from '../../../../modifier/modifiers/shield.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';

export const windcliffeStronghold: LocationBlueprint = {
  id: 'windcliffe-stronghold',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: 'Windcliffe Stronghold',
  description: dedent /*html*/ `
    When a minion moves here, its controller may pay <rt-mana>1</rt-mana> to give it <rt-keyword>Shield</rt-keyword> this turn.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('windcliffe-stronghold', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_MOVE,
            filter: event =>
              isMinion(event.data.card) &&
              event.data.to.position.zone === card.location &&
              event.data.card.player.canSpendMana(1),
            async handler(event) {
              const minion = event.data.card;
              if (!isMinion(minion)) return;

              const shouldPay = await askMandatoryYesNoQuestion({
                game,
                card,
                player: minion.player,
                questionId: 'windcliffe-stronghold-shield',
                aiChoice: 'yes',
                label: `Pay <rt-mana>1</rt-mana> to give ${minion.blueprint.name} <rt-keyword>Shield</rt-keyword> this turn ?`
              });
              if (!shouldPay) return;

              await minion.player.spendMana(1);
              await minion.modifiers.add(
                new ShieldModifier(game, card, {
                  mixins: [new UntilEndOfTurnModifierMixin(game)]
                })
              );
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
