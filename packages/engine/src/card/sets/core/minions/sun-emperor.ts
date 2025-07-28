import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const sunEmperor: MinionBlueprint = {
  id: 'sun-emperor',
  name: 'Sun Emperor',
  cardIconId: 'unit-sun-emperor',
  description: `@On Enter@: Activate an artifact.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 3,
  maxHp: 4,
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
        if (card.player.artifactManager.artifacts.length === 0) {
          return;
        }

        const [artifact] = await game.interaction.chooseCards({
          player: card.player,
          label: 'Choose an artifact to activate',
          minChoiceCount: 0,
          maxChoiceCount: 1,
          choices: card.player.artifactManager.artifacts
        });

        if (!artifact) return;
        await artifact.wakeUp();
      })
    );
  },
  async onPlay() {}
};
