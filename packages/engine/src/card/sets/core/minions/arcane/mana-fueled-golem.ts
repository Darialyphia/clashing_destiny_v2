import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { askMandatoryYesNoQuestion } from '../../../../card-actions-utils';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import type { MinionCard } from '../../../../entities/minion.entity';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

export const manaFueledGolem: MinionBlueprint = {
  id: 'manaFueledGolem',
  name: 'Mana-fueled Golem',
  description: dedent /*html*/ `
    At the start of your turn, you may pay 1 mana. If you don't, exhaust this minion.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  commandment: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<MinionCard>('mana-fueled-golem', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_START,
            handler: async () => {
              const answer = await askMandatoryYesNoQuestion({
                game,
                card,
                questionId: 'manaPayment',
                label: 'Pay 1 mana to avoid exhausting this minion ?',
                timeoutFallback: 'yes',
                aiChoice: 'yes'
              });
              if (answer) return;
              await card.exhaust();
            }
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
