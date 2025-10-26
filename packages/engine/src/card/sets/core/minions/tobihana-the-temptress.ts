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
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { MinionCard } from '../../../entities/minion.entity';

export const tobihanatheTemptress: MinionBlueprint = {
  id: 'tobihana-the-temptress',
  name: 'Tobihana, the Temptress',
  cardIconId: 'minions/tobihana-the-temptress',
  description: dedent`
  @Unique@.
  @[level] 2+@ @On Enter@ : take control of an enemy minion with 2 @[attack]@ or less and exhaust it.
  `,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 2,
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
    const levelMode = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 2)
    )) as LevelBonusModifier<MinionCard>;

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          if (!levelMode.isActive) return;
          if (!singleEnemyMinionTargetRules.canPlay(game, card, c => c.atk <= 2)) return;
          if (!singleEmptyAllySlot.canPlay(game, card)) return;

          const [target] = await singleEnemyMinionTargetRules.getPreResponseTargets(
            game,
            card,
            { type: 'card', card },
            c => c.atk <= 2
          );

          const [newPosition] = await singleEmptyAllySlot.getPreResponseTargets(
            game,
            card
          );
          await target.removeFromCurrentLocation();

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
          await target.player.boardSide.summonMinion(
            target,
            newPosition.zone,
            newPosition.slot
          );
          await target.exhaust();
        }
      })
    );
  },
  async onPlay() {}
};
