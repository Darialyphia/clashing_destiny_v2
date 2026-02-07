import type { ArtifactBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  ARTIFACT_KINDS,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { singleAllyMinionTargetRules } from '../../../../card-utils';
import type { MinionCard } from '../../../../entities/minion.entity';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';

export const honorableCrown: ArtifactBlueprint = {
  id: 'honorable-crown',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Honorable Crown',
  description: '',
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
  subKind: ARTIFACT_KINDS.RELIC,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  destinyCost: 1,
  durability: 1,
  speed: CARD_SPEED.SLOW,
  abilities: [
    {
      id: 'honorable-crown-ability',
      description:
        'Give an allied minion @Honor@: @On Death@ : Put this in the Destiny Zone',
      label: 'Buff Ally Minion',
      canUse: (game, card) =>
        card.location === CARD_LOCATIONS.BOARD &&
        singleAllyMinionTargetRules.canPlay(game, card),
      getPreResponseTargets(game, card) {
        return singleAllyMinionTargetRules.getPreResponseTargets(
          game,
          card,
          {
            type: 'ability',
            abilityId: 'honorable-crown-ability',
            card
          },
          c => c.modifiers.has(HonorModifier)
        );
      },
      manaCost: 1,
      durabilityCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.BURST,
      async onResolve(game, card, targets) {
        for (const target of targets as MinionCard[]) {
          if (target.location !== CARD_LOCATIONS.BOARD) continue;

          await target.modifiers.add(
            new OnDeathModifier(game, card, {
              async handler(event, modifier) {
                await card.sendToDestinyZone();
                await modifier.remove();
              }
            })
          );
        }
      }
    }
  ],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
