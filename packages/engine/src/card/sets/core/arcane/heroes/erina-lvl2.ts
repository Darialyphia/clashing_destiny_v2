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

export const erinaLv2: HeroBlueprint = {
  id: 'erina-aether-scholar',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Erina, Aether Scholar',
  description: 'This has +1 Attack as long as you played a spell this turn.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
  tags: [],
  art: {
    default: {
      foil: {
        oil: true,
        lightGradient: true
      },
      dimensions: {
        width: 174,
        height: 140
      },
      bg: 'heroes/erina-lv2-bg',
      main: 'heroes/erina-lv2',
      breakout: 'heroes/erina-lv2-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 2,
  runeCost: {},
  level: 2,
  lineage: 'erina',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 18,
  canPlay: () => true,
  abilities: [
    {
      id: 'erina-lv2-ability-1',
      canUse: (game, card) => card.location === 'board',
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
