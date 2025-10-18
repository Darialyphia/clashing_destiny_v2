import { OnAttackModifier } from '../../../../modifier/modifiers/on-attack.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';

export const flamefistFighter: MinionBlueprint = {
  id: 'flamefist-fighter',
  name: 'Flamefist Fighter',
  cardIconId: 'minions/flamefist-fighter',
  description: `@On Attack@ : You may discard a Fire card from your hand to give this +2 @[attack]@.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          const fireCards = card.player.cardManager.hand.filter(
            c => 'spellSchool' in c && c.spellSchool === SPELL_SCHOOLS.FIRE
          );

          if (fireCards.length === 0) return;

          const [cardToDiscard] = await game.interaction.chooseCards({
            player: card.player,
            minChoiceCount: 0,
            maxChoiceCount: 1,
            label: 'Discard a Fire card to empower Flamefist Fighter?',
            choices: fireCards
          });

          if (!cardToDiscard) return;
          await cardToDiscard.discard();

          await card.modifiers.add(
            new SimpleAttackBuffModifier('flamefist-fighter-attack-buff', game, card, {
              amount: 2
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
