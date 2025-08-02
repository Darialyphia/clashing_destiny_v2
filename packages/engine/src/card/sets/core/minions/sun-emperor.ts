import type { MinionPosition } from '../../../../game/interactions/selecting-minion-slots.interaction';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const sunEmperor: MinionBlueprint = {
  id: 'sun-emperor',
  name: 'Sun Emperor',
  cardIconId: 'unit-sun-emperor',
  description: ``,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 2,
  maxHp: 4,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [
    {
      id: 'sun-emperor-ability',
      label: '@[exhaust]@  @[mana] 1@ : Summon a Sun Palace Guard',
      description:
        '@[exhaust]@ @[mana] 1@ : @Summon a @Sun Palace Guard@ in your Attack zone.',
      shouldExhaust: true,
      manaCost: 1,
      canUse(game, card) {
        return (
          card.location === 'board' &&
          card.player.boardSide.attackZone.slots.some(slot => !slot.isOccupied)
        );
      },
      async getPreResponseTargets(game, card) {
        return game.interaction.selectMinionSlot({
          player: card.player,
          isElligible: slot =>
            card.player.boardSide.attackZone.slots.some(s => s.isSame(slot)),
          canCommit(selectedSlots) {
            return selectedSlots.length === 1;
          },
          isDone(selectedSlots) {
            return selectedSlots.length === 1;
          }
        });
      },
      async onResolve(game, card, targets) {
        const [position] = targets;
        if (!position) return;

        const sunPalaceGuard =
          await card.player.generateCard<MinionCard>('sun-palace-guard');
        await sunPalaceGuard.playAt(position as MinionPosition);
      }
    }
  ],
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
