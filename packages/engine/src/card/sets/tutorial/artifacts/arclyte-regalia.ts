import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { EquippedModifier } from '../../../../modifier/modifiers/equip.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';

export const tutorialArclyteRegalia: ArtifactBlueprint = {
  id: 'tutorial-arclyte-regalia',
  name: 'Arclyte Regalia',
  description: '',
  collectable: false,
  setId: CARD_SETS.TUTORIAL,
  art: defaultCardArt('artifacts/arclyte-regalia'),
  kind: CARD_KINDS.ARTIFACT,
  rarity: RARITIES.TOKEN,
  affinities: [AFFINITIES.LIGHT],
  manaCost: 1,
  manaSupply: 2,
  durability: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  shouldHideTargetArrows: true,
  abilities: [
    {
      id: 'tutorial-arclyte-regalia-equip',
      label: 'Equip',
      description: dedent /*html*/ `
      <rt-keyword>Equip</rt-keyword>: Give the equipped minion +2 influence.
      `,
      manaCost: 1,
      canUse: (game, card) => singleAllyMinionTargetRules.canPlay(game, card),
      getTargets: (game, card) =>
        singleAllyMinionTargetRules.getTargets({
          game,
          card,
          // the mana is paid before choosing the target, so cancelling would waste it
          canCancel: false,
          timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(game, card),
          aiHints: {
            shouldPick: () => 1
          }
        }),
      async onResolve(game, card, targets) {
        const target = targets.cards[0] as MinionCard;
        if (!target) return;

        if (card.modifiers.has(EquippedModifier)) {
          await card.modifiers.remove(EquippedModifier);
        }

        await card.modifiers.add(
          new EquippedModifier(game, card, {
            attachedTo: target,
            modifiersToAdd: [
              new SimpleCommandmentBuffModifier(
                'tutorial-arclyte-regalia-influence-buff',
                game,
                card,
                { amount: 2 }
              )
            ]
          })
        );
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1
  }
};
