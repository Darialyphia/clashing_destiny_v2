import { isDefined } from '@game/shared';
import { OnAttackModifier } from '../../../../modifier/modifiers/on-attack';
import type { DestinyBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { MinionCard } from '../../../entities/minion.entity';

export const fearlessLeader: DestinyBlueprint = {
  id: 'fearless-leader',
  name: 'Fearless Leader',
  cardIconId: 'talent-fearless-leader',
  description:
    'Give your hero @On Attack@ : give +1 @[attack]@ to your minions in the Attack zone.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 3,
  countsAsLevel: true,
  abilities: [],
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          const minions = card.player.boardSide.attackZone.slots
            .map(slot => slot.minion)
            .filter(isDefined);

          for (const minion of minions) {
            await minion.modifiers.add(
              new SimpleAttackBuffModifier<MinionCard>(
                'fearless-leader-buff',
                game,
                card,
                {
                  amount: 1
                }
              )
            );
          }
        }
      })
    );
  }
};
