import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

export const powerOverwhelming: SpellBlueprint = {
  id: 'power-overwhelming',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Power Overwhelming',
  description: dedent`
  Your hero gains Atk equals to the amount of Arcane spells in your Banish pile.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
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
      bg: 'spells/power-overwhelming-bg',
      main: 'spells/power-overwhelming',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 2,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new SimpleAttackBuffModifier('power-overwhelming-attack-buff', game, card, {
        amount: Array.from(card.player.cardManager.banishPile).filter(
          c => c.kind === CARD_KINDS.SPELL && c.faction === FACTIONS.ARCANE
        ).length,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
};
