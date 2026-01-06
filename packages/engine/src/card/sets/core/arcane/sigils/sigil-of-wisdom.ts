import type { SigilBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { SigilCard } from '../../../../entities/sigil.entity';
import dedent from 'dedent';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { isSpell } from '../../../../card-utils';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';

export const sigilOfWisdom: SigilBlueprint = {
  id: 'sigil-of-wisdom',
  kind: CARD_KINDS.SIGIL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Sigil of Wisdom',
  description: dedent`
  The first spell you play each turn costs 1 less.

  @On Destroyed@: Draw a card.
  `,
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
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 3,
  abilities: [],
  maxCountdown: 3,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          await card.player.cardManager.draw(1);
        }
      })
    );
    await card.modifiers.add(
      new WhileOnBoardModifier<SigilCard>(
        'sigil-of-wisdom-cost-reduction-aura',
        game,
        card,
        {
          mixins: [
            new TogglableModifierMixin(
              game,
              () =>
                card.player.cardTracker.getCardsPlayedThisGameTurnOfKind(CARD_KINDS.SPELL)
                  .length === 0
            ),
            new AuraModifierMixin(game, card, {
              isElligible(candidate) {
                return isSpell(candidate) && candidate.location === CARD_LOCATIONS.HAND;
              },
              getModifiers(candidate) {
                return [
                  new SimpleManacostModifier(
                    'sigil-of-wisdom-mana-cost-reduction',
                    game,
                    candidate,
                    {
                      amount: -1
                    }
                  )
                ];
              }
            })
          ]
        }
      )
    );
  },
  async onPlay() {}
};
