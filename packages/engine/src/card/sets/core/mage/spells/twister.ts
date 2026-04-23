import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS, TAGS } from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';

export const twister: SpellBlueprint = {
  id: 'twister',
  name: 'Twister',
  description: dedent`
  Put target minion that costs less than your hero level on top of its owner's deck.
  <rt-lvl-bonus lvl="4">You can choose to put it on the bottom instead.</rt-lvl-bonus> 
  `,
  kind: CARD_KINDS.SPELL,
  collectable: false,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.AIR],
  manaCost: 3,
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, c => c.card.manaCost < card.playerLevel),
  getTargets(game, card, onCancel) {
    return singleMinionTargetRules.getTargets(game, card, {
      predicate: c => c.card.manaCost < card.playerLevel,
      getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
      canCancel: true,
      onCancel,
      timeoutFallback: []
    });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
  },
  async onPlay(game, card, { targets }) {
    const target = targets[0].unit;
    if (!target) return;

    const lvlMod = card.modifiers.get(LevelBonusModifier)!;
    if (lvlMod.isActive) {
      const choice = await game.interaction.askQuestion({
        player: card.player,
        questionId: 'twister-position',
        label: 'Put on top or bottom of the deck?',
        source: card,
        choices: [
          { id: 'top', label: 'Top' },
          { id: 'bottom', label: 'Bottom' }
        ],
        timeoutFallback: 'top'
      });

      if (choice === 'bottom') {
        const unitCard = target.card;
        await target.removeFromBoard();
        await unitCard.sendToBottomOfDeck();
        return;
      } else {
        const unitCard = target.card;
        await target.removeFromBoard();
        await unitCard.sendToTopOfDeck();
        return;
      }
    } else {
      const unitCard = target.card;
      await target.removeFromBoard();
      await unitCard.sendToTopOfDeck();
    }
  }
};
