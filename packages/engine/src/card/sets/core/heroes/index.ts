import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { RUNES, type Rune } from '../../../../player/player.enums';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';
import type { HeroBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion, isSpell } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED,
  CARD_LOCATIONS
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { ChannelModifier } from '../../../../modifier/modifiers/channel.modifier';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import {
  LocationToggleModifierMixin,
  TogglableModifierMixin
} from '../../../../modifier/mixins/togglable.mixin';

export const erinaVioletWitch: HeroBlueprint = {
  id: 'erina-violet-witch',
  kind: CARD_KINDS.HERO,
  collectable: true,
  name: 'Erina, Violet Witch',
  description: dedent /*html*/ `
    When you play 3 spells in a turn, you may consume <rt-runes runes="colorless"></rt-runes>to gain 1 mana and draw a card.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('heroes/erina-violet-witch'),
  speed: CARD_SPEED.SLOW,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE, AFFINITIES.FIRE],
  tags: [],
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<HeroCard>('erina-violet-witch', game, card, {
        name: 'Spellslinger',
        description:
          'When you play 3 spells in a turn, you may consume a rune to gain 1 mana and draw a card.',
        icon: 'icons/erina-passive',
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter: event =>
              event.data.card.player.equals(card.player) &&
              isSpell(event.data.card) &&
              card.player.cardTracker.getCardsPlayedThisTurnOfKind(CARD_KINDS.SPELL)
                .length === 3,
            async handler() {
              if (card.player.runeManager.runeCount === 0) return;

              const answer = await askMandatoryYesNoQuestion({
                game,
                card,
                aiChoice: 'no',
                label: `Consume a rune to gain 2 mana and draw a card?`,
                questionId: 'erina-violet-witch-activation',
                timeoutFallback: 'no'
              });

              if (!answer) return;

              const runeResult = await game.interaction.askQuestion({
                player: card.player,
                canCancel: false,
                label: 'Choose a rune to consume',
                questionId: 'erina-violet-witch-rune-selection',
                source: card,
                choices: [
                  ...Object.values(RUNES).map(rune => ({
                    id: rune,
                    label: rune,
                    aiHints: { shouldPick: () => 0.5 }
                  }))
                ].filter(choice => card.player.runeManager.has({ [choice.id]: 1 })),
                timeoutFallback: RUNES.FOCUS
              });

              if (runeResult.cancelled) return;
              await card.player.runeManager.remove([runeResult.result[0] as Rune]);
              await card.player.manaManager.gain(1);
              await card.player.cardManager.draw(1);
            }
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1
  }
};

export const haroldVowedCrusader: HeroBlueprint = {
  id: 'harold-vowed-crusader',
  kind: CARD_KINDS.HERO,
  collectable: true,
  name: 'Harold Vowed Crusader',
  description: dedent /*html*/ `
    Your minions have "<rt-location locations="battlefield"></rt-location> <rt-keyword>Channel</rt-keyword> : Gain +1 Health."
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('heroes/harold-vowed-crusader'),
  speed: CARD_SPEED.SLOW,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.LIGHT, AFFINITIES.EARTH],
  tags: [],
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<HeroCard>('harold-vowed-crusader', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return candidate.isAlly(card) && isMinion(candidate);
            },
            getModifiers(candidate) {
              return [
                new ChannelModifier(game, card, {
                  handler: async () => {
                    await candidate.modifiers.add(
                      new SimpleHealthBuffModifier(
                        'harold-vowed-crusader-aura',
                        game,
                        card,
                        { amount: 1 }
                      )
                    );
                  },
                  mixins: [
                    new LocationToggleModifierMixin(game, [
                      CARD_LOCATIONS.LEFT_BATTLEFIELD,
                      CARD_LOCATIONS.RIGHT_BATTLEFIELD
                    ])
                  ]
                })
              ];
            }
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1
  }
};
