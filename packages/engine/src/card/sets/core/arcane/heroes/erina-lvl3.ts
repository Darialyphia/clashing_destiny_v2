import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { isSpell } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';

export const erinaLv3: HeroBlueprint = {
  id: 'erina-arcane-weaver',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Erina, Arcane Weaver',
  description: 'Has +1@[atk]@as long as you played a spell this turn.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.LEGENDARY,
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
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 3,
  runeCost: {},
  level: 3,
  lineage: 'erina',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 21,
  canPlay: () => true,
  abilities: [
    {
      id: 'erina-lv3-ability-1',
      canUse: () => true,
      shouldExhaust: true,
      manaCost: 2,
      runeCost: {},
      description: 'Draw a spell, then discard 1 card.',
      getPreResponseTargets: () => Promise.resolve([]),
      label: 'Draw a spell and discard',
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        await card.player.cardManager.drawWithFilter(1, isSpell);
        const [cardToDiscard] = await game.interaction.chooseCards({
          player: card.player,
          label: 'Choose a card to discard',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          choices: card.player.cardManager.hand
        });
        await cardToDiscard.discard();
      }
    },
    {
      id: 'erina-lv3-ability-2',
      canUse: () => true,
      shouldExhaust: true,
      manaCost: 1,
      runeCost: {},
      description: 'The next spell you play this turn has @Echo@ and @Empower 2@',
      getPreResponseTargets: () => Promise.resolve([]),
      label: 'Improve next spell',
      speed: CARD_SPEED.BURST,
      async onResolve(game, card) {}
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleAttackBuffModifier('erina-lv2-attack-buff', game, card, {
        amount: 1,
        mixins: [
          new TogglableModifierMixin(
            game,
            () =>
              card.player.cardTracker.getCardsPlayedThisGameTurnOfKind(CARD_KINDS.SPELL)
                .length > 0
          )
        ]
      })
    );
  },
  async onPlay() {}
};
