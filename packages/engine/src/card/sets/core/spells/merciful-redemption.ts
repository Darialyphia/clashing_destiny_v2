import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleAllyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.entity';

export const mercifulRedemption: SpellBlueprint = {
  id: 'merciful-redemption',
  name: 'Merciful Redemption',
  cardIconId: 'spells/merciful-redemption',
  description:
    'Give an ally minion "@On Death@ : You may discard a card. If you do, summon an @Angel of Mercy@ on this position."',
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  abilities: [],
  tags: [],
  canPlay: singleAllyTargetRules.canPlay,
  getPreResponseTargets(game, card) {
    return singleAllyTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;

    await target.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler(event, modifier, position) {
          if (target.player.cardManager.hand.length === 0) return;
          const [cardToDiscard] = await game.interaction.chooseCards({
            player: target.player,
            label: 'Choose a card to discard to summon Angel of Mercy',
            minChoiceCount: 0,
            maxChoiceCount: 1,
            choices: target.player.cardManager.hand
          });

          if (!cardToDiscard) return;

          await cardToDiscard.discard();
          const angel = await target.player.generateCard<MinionCard>('angel-of-mercy');
          await angel.playImmediatelyAt(position);
        }
      })
    );
  }
};
