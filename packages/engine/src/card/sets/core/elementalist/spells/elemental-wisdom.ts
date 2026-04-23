import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt, isSpell } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS, TAGS } from '../../../../card.enums';
import { RingAOEShape } from '../../../../../aoe/ring.aoe-shape';
import { discardFromHand } from '../../../../card-actions-utils';
import { fireShard } from '../../mage/spells/fire-shard';
import { waterShard } from '../../mage/spells/water-shard';
import { airShard } from '../../mage/spells/air-shard';
import { earthShard } from '../../mage/spells/earth-shard';

export const elementalWisdom: SpellBlueprint = {
  id: 'elemental-wisdom',
  name: 'Elemental Wisdom',
  description: dedent`
  Draw 2 then discard 1. If the discarded card is a Fire, Water, Air, or Earth spell, add an <rt-card>Fire Shard</rt-card>, <rt-card>Water Shard</rt-card>, <rt-card>Air Shard</rt-card>, or <rt-card>Earth Shard</rt-card> to your hand depending on the discarded card.
   `,
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.ELEMENTALIST.id],
  tags: [],
  manaCost: 3,
  canPlay: () => true,
  getTargets(game, card, onCancel) {
    return anywhereTargetRules.getTargets({ min: 1, max: 1 })(game, card, {
      predicate: cell => !!cell.player?.equals(card.player),
      getAoe: () => new PointAOEShape(TARGETING_TYPE.EMPTY, {}),
      canCancel: true,
      onCancel,
      timeoutFallback: []
    });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.EMPTY, {}),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.cardManager.drawFromDeck(2);
    const [discardedCard] = await discardFromHand(game, card, { min: 1, max: 1 });
    if (!isSpell(discardedCard)) return;

    if (discardedCard.hasTag(TAGS.FIRE)) {
      const shard = await card.player.generateCard(fireShard.id, card.isFoil);
      await shard.addToHand();
    } else if (discardedCard.hasTag(TAGS.WATER)) {
      const shard = await card.player.generateCard(waterShard.id, card.isFoil);
      await shard.addToHand();
    } else if (discardedCard.hasTag(TAGS.AIR)) {
      const shard = await card.player.generateCard(airShard.id, card.isFoil);
      await shard.addToHand();
    } else if (discardedCard.hasTag(TAGS.EARTH)) {
      const shard = await card.player.generateCard(earthShard.id, card.isFoil);
      await shard.addToHand();
    }
  }
};
