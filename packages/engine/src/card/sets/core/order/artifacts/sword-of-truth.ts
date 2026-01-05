import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  ARTIFACT_KINDS
} from '../../../../card.enums';
import { equipWeapon } from '../../../../card-utils';
import { OnKillModifier } from '../../../../../modifier/modifiers/on-kill.modifier';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';

export const swordOfTruth: ArtifactBlueprint = {
  id: 'sword-of-truth',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Sword of Truth',
  description: dedent`
  Your Hero has "@On Kill@: draw a card".`,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.EPIC,
  subKind: ARTIFACT_KINDS.WEAPON,
  atkBonus: 1,
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
  durability: 2,
  speed: CARD_SPEED.SLOW,
  abilities: [
    equipWeapon({
      modifierType: 'sword-of-truth-attack-buff',
      durabilityCost: 1,
      manaCost: 0,
      speed: CARD_SPEED.BURST
    })
  ],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier('sword-of-truth-hero-modifier', game, card, {
        mixins: [
          new AuraModifierMixin(game, card, {
            isElligible(candidate) {
              return candidate.equals(card.player.hero);
            },
            getModifiers() {
              return [
                new OnKillModifier(game, card, {
                  async handler() {
                    await card.player.cardManager.draw(1);
                  }
                })
              ];
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
