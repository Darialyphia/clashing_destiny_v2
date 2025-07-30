import type { MainDeckCard } from '../../../../board/board.system';
import { CleaveModifier } from '../../../../modifier/modifiers/cleave.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const ardentMonk: MinionBlueprint = {
  id: 'ardentMonk',
  name: 'Ardent Monk',
  cardIconId: 'unit-ardent-monk',
  description: `@On Enter@: You may discard a card. Then, depending on the discarded card: \n• Minion: this gain +2@[attack]@ \n• Spell: draw a card@ \n• Artifact: this gains @Cleave@.`,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 2,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        const [discardedCard] = await game.interaction.chooseCards<MainDeckCard>({
          player: card.player,
          label: 'Choose a card to discard',
          minChoiceCount: 0,
          maxChoiceCount: 1,
          choices: card.player.cardManager.hand
        });

        if (!discardedCard) return;

        card.player.cardManager.discard(discardedCard);

        if (discardedCard.kind === CARD_KINDS.MINION) {
          await card.modifiers.add(
            new SimpleAttackBuffModifier('ardentMonkMinionBuff', game, card, {
              amount: 2
            })
          );
        } else if (discardedCard.kind === CARD_KINDS.SPELL) {
          await card.player.cardManager.draw(1);
        } else if (discardedCard.kind === CARD_KINDS.ARTIFACT) {
          await card.modifiers.add(new CleaveModifier(game, card));
        }
      })
    );
  },
  async onPlay() {}
};
