import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS } from '../../../../card.enums';
import { predict } from '../../../../card-actions-utils';
import { getWheelOfElementModifier } from '../../../../../modifier/modifiers/wheel-of-elements.modifier';

export const peerIntoTheEssence: SpellBlueprint = {
  id: 'peer-into-the-essence',
  name: 'Peer into the Essence',
  description: dedent`
  <rt-keyword>Predict</rt-keyword>, then draw a card. Cycle your <rt-card>Wheel of the Elements</rt-card> to the element of your choice.
   `,
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.ELEMENTALIST.id],
  tags: [],
  manaCost: 2,
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
    await predict(game, card);
    await card.player.cardManager.drawFromDeck(1);
    const wheelMod = getWheelOfElementModifier(game, card.player);

    const newElement = await game.interaction.askQuestion({
      player: card.player,
      questionId: 'peer-into-the-essence-element-choice',
      label: 'Choose an element to cycle your Wheel of the Elements to',
      source: card,
      choices: [
        { id: 'fire', label: 'Fire' },
        { id: 'water', label: 'Water' },
        { id: 'air', label: 'Air' },
        { id: 'earth', label: 'Earth' }
      ],
      timeoutFallback: 'fire'
    });

    await wheelMod?.rotateTo(newElement as any);
  }
};
