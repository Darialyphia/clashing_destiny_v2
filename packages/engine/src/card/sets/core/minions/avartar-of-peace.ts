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
import { singleEnemyMinionTargetRules } from '../../../card-utils';
import { Modifier } from '../../../../modifier/modifier.entity';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';

export const avatarOfPeace: MinionBlueprint = {
  id: 'avatar-of-peace',
  name: 'Avatar of Peace',
  cardIconId: 'minions/avatar-of-peace',
  description: dedent`
  @On Enter@: Target enemy minion cannot attack while this is on the board.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 1,
  maxHp: 5,
  rarity: RARITIES.COMMON,
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
          const [target] = await singleEnemyMinionTargetRules.getPreResponseTargets(
            game,
            card,
            { type: 'card', card }
          );
          const modifierId = 'avatar-of-peace-attack-prevention';
          await target.modifiers.add(
            new Modifier(modifierId, game, card, {
              mixins: [
                new MinionInterceptorModifierMixin(game, {
                  key: 'canAttack',
                  interceptor() {
                    return false;
                  }
                })
              ]
            })
          );

          const stop = game.on('*', async () => {
            if (card.location !== 'board') {
              await target.modifiers.remove(modifierId);
              stop();
            }
          });
        }
      })
    );
  },
  async onPlay() {}
};
