import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { EphemeralCardModifier } from '../../../../../modifier/modifiers/ephemeral.modifier';
import { Player } from '../../../../../player/player.entity';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES } from '../../../../card.enums';
import type { AnyCard } from '../../../../entities/card.entity';
import { airShard } from '../../mage/spells/air-shard';
import { earthShard } from '../../mage/spells/earth-shard';
import { fireShard } from '../../mage/spells/fire-shard';
import { waterShard } from '../../mage/spells/water-shard';

export const prismInvocation: DestinyBlueprint = {
  id: 'prism_invocation',
  name: 'Prism Invocation',
  description:
    '<rt-ability cost="1"></rt-ability> Discard 2 Elemental Shards with the same name to summon an elemental of the corresponding element.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.RARE,
  jobs: [JOBS.ELEMENTALIST.id],
  tags: [],
  expCost: 3,
  getTargets: () => Promise.resolve([]),
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {
    await card.player.modifiers.add(
      new Modifier<Player>('elemental-alcemy', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.MODIFIER_WHEEL_OF_ELEMENTS_ROTATE,
            filter: event => {
              if (!event) return false;
              return event.data.player.equals(card.player);
            },
            async handler(event) {
              const newElement = event?.data.to;
              if (!newElement) return;

              let shard: AnyCard;
              if (newElement === 'fire') {
                shard = await card.player.generateCard(fireShard.id, card.isFoil);
              } else if (newElement === 'water') {
                shard = await card.player.generateCard(waterShard.id, card.isFoil);
              } else if (newElement === 'air') {
                shard = await card.player.generateCard(airShard.id, card.isFoil);
              } else {
                shard = await card.player.generateCard(earthShard.id, card.isFoil);
              }
              await shard.addToHand();
              await shard.modifiers.add(new EphemeralCardModifier(game, card));
            }
          })
        ]
      })
    );
  }
};
