import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { singleEmptyAllySlot, singleEnemyMinionTargetRules } from '../../../card-utils';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';

export const tobihanatheTemptress: MinionBlueprint = {
  id: 'tobihana-the-temptress',
  name: 'Tobihana, the Temptress',
  cardIconId: 'minions/tobihana-the-temptress',
  description: dedent`
  @Unique@.
  @On Enter@ : take control of an enemy minion with 2 @[attack]@ or less and exhaust it.
  `,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 3,
  maxHp: 3,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: null,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          if (!singleEnemyMinionTargetRules.canPlay(game, card)) return;
          if (!singleEmptyAllySlot.canPlay(game, card)) return;

          const [target] = await singleEnemyMinionTargetRules.getPreResponseTargets(
            game,
            card,
            { type: 'card', card }
          );

          const [newPosition] = await singleEmptyAllySlot.getPreResponseTargets(
            game,
            card
          );
          await target.exhaust();
          const modifierId = 'tobihana-the-temptress-control';
          await target.modifiers.add(
            new Modifier(modifierId, game, card, {
              mixins: [
                new MinionInterceptorModifierMixin(game, {
                  key: 'player',
                  interceptor() {
                    return card.player;
                  }
                })
              ]
            })
          );
          await target.moveTo(newPosition);
        }
      })
    );
  },
  async onPlay() {}
};
