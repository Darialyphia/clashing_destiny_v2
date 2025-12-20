import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { OnHitModifier } from '../../../../../modifier/modifiers/on-hit.modifier';
import { StealthModifier } from '../../../../../modifier/modifiers/stealth.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { CARD_LOCATIONS } from '../../../../components/card-manager.component';

export const manaLooter: MinionBlueprint = {
  id: 'mana-looter',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Mana Looter',
  description: '@On Hero Hit@: draw a card.\n\n',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'minions/mana-looter-bg',
      main: 'minions/mana-looter',
      breakout: 'minions/mana-looter-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 3,
  runeCost: {
    KNOWLEDGE: 1,
    FOCUS: 1
  },
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  canPlay: () => true,
  abilities: [
    {
      id: 'mana-looter-ability',
      description: 'Give this unit @Stealth@ this turn, then wake up this minion.',
      label: 'Gain Stealth',
      canUse: (game, card) => card.location === CARD_LOCATIONS.BOARD,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 2,
      shouldExhaust: true,
      runeCost: {},
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        await card.modifiers.add(
          new StealthModifier(game, card, {
            mixins: [new UntilEndOfTurnModifierMixin(game)]
          })
        );
        await card.wakeUp();
      }
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnHitModifier(game, card, {
        async handler(event) {
          if (!event.data.target.equals(card.player.opponent.hero)) return;
          await card.player.cardManager.draw(1);
        }
      })
    );
  },
  async onPlay() {}
};
