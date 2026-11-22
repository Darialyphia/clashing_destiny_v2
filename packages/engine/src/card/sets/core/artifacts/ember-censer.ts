import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  isMinion,
  singleAllyMinionTargetRules
} from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, CARD_SPEED, RARITIES } from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { EquippedModifier } from '../../../../modifier/modifiers/equip.modifier';
import { ChannelModifier } from '../../../../modifier/modifiers/channel.modifier';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { isDefined } from '@game/shared';
import { FACTION_IDS } from '../../../factions/factions';

export const emberCenser: ArtifactBlueprint = {
  id: 'ember-censer',
  name: 'Ember Censer',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.ARTIFACT,
  rarity: RARITIES.RARE,
  manaCost: 2,
  manaSupply: 2,
  level: 2,
  exp: 1,
  factionId: FACTION_IDS.VETRUVIAN,
  durability: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  abilities: [
    {
      id: 'ember-censer-equip',
      label: 'Equip',
      description: dedent /*html*/ `
      <rt-keyword>Equip</rt-keyword>: Give the equipped minion "<rt-location locations="battlefield"></rt-location> <rt-keyword>Channel</rt-keyword>: Inflict <rt-keyword>Burn 1</rt-keyword> to all enemy minions here."
      `,
      manaCost: 1,
      canUse: (game, card) => singleAllyMinionTargetRules.canPlay(game, card),
      getTargets: (game, card) =>
        singleAllyMinionTargetRules.getTargets({
          game,
          card,
          canCancel: true,
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
              new ChannelModifier('ember-censer-channel', game, card, {
                async handler() {
                  if (!target.battlefield) return;

                  const enemies = target.battlefield.opponentSpaces
                    .map(space => space.card)
                    .filter(isDefined)
                    .filter(isMinion);

                  for (const enemy of enemies) {
                    await enemy.modifiers.add(
                      new BurnModifier(game, card, { stacks: 1 })
                    );
                  }
                }
              })
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
