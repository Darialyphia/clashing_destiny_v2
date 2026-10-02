import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, emptyBoardSpaceTargetRules } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES,
  CARD_LOCATIONS
} from '../../../card.enums';
import { SpawnModifier } from '../../../../modifier/modifiers/spawn.modifier';
import { windDervish } from './wind-dervish';
import { StructureModifier } from '../../../../modifier/modifiers/structure.modifier';
import type { MinionCard } from '../../../entities/minion.entity';

export const etherealObelysk: MinionBlueprint = {
  id: 'ethereal-obelysk',
  name: 'Ethereal Obelysk',
  description: dedent /*html*/ `
  <rt-keyword>Structure</rt-keyword>.
  <rt-keyword>Spawn</rt-keyword>: <rt-card>Wind Dervish</rt-card>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/ethereal-obelysk'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 0,
  maxHp: 2,
  affinities: [AFFINITIES.AIR],
  commandment: 1,
  canPlay: () => true,
  abilities: [
    {
      id: 'ethereal-obelysk-ability',
      label: 'Summon Wind Dervish',
      description: 'Summon a Wind Dervish in your base.',
      shouldExhaust: true,
      canUse: game => emptyBoardSpaceTargetRules.canPlay(game, space => space.isInBase),
      getTargets: (game, card) =>
        emptyBoardSpaceTargetRules.getTargets({
          game,
          card,
          label: 'Select an empty space in your base',
          canCancel: true,
          predicate: space => space.isInBase,
          timeoutFallback: emptyBoardSpaceTargetRules.defaultTimeoutFallback(
            game,
            space => space.isInBase
          )
        }),
      manaCost: 1,
      aiHints: {
        shouldUse: () => 1
      },
      async onResolve(game, card, targets) {
        const space = targets.spaces[0];
        if (!space) return;
        const dervish = await card.player.generateCard<MinionCard>(
          windDervish.id,
          card.isFoil
        );
        await dervish.playImmediatelyAt(space, { shouldExhaust: false });
      }
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(new StructureModifier(game, card));
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
