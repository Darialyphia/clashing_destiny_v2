import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { RUNES, type Rune } from '../../../../player/player.enums';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';
import type { HeroBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isSpell } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';

export const erinaVioletWitch: HeroBlueprint = {
  id: 'erina-violet-witch',
  kind: CARD_KINDS.HERO,
  collectable: true,
  name: 'Erina, Violet Witch',
  description: dedent /*html*/ `
    When you play 3 spells in a turn, you may consume <rt-runes runes="colorless"></rt-runes>to gain 2 mana and draw a card.
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
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter: event =>
              event.data.card.player.equals(card.player) &&
              isSpell(event.data.card) &&
              card.player.cardTracker.getCardsPlayedThisTurnOfKind(CARD_KINDS.SPELL)
                .length === 3,
            async handler() {
              const answer = await askMandatoryYesNoQuestion({
                game,
                card,
                aiChoice: 'no',
                label: `Consume a rune to gain 1 mana and draw a card?`,
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
              await card.player.manaManager.gain(2);
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
