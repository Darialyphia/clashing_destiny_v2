import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { RUNES, type Rune } from '../../../../player/player.enums';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';
import type { HeroBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt, isSpell } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import { CardEffectTriggeredEvent } from '../../../card.events';
import { SpellSlingerCounterModifier } from '../../../../modifier/modifiers/counters.modifier';

export const erinaVioletWitch: HeroBlueprint = {
  id: 'erina-violet-witch',
  kind: CARD_KINDS.HERO,
  collectable: true,
  name: 'Erina, Violet Witch',
  description: dedent /*html*/ `
    When you play a spell, gain a stack of <rt-trigger color="green">SpellSlinger</rt-trigger>.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('heroes/erina-violet-witch'),
  speed: CARD_SPEED.SLOW,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE, AFFINITIES.FIRE],
  tags: [],
  abilities: [
    {
      id: 'erina-violet-witch-ability',
      description: dedent /*html*/ `
    Remove 4 stacks of <rt-trigger color="green">SpellSlinger</rt-trigger> from this card to draw a card. <rt-runes runes="wisdom,wisdom"></rt-runes> gain 1 mana as well.`,
      label: 'Draw a card',
      canUse: (game, card) => {
        const modifier = card.modifiers.get(SpellSlingerCounterModifier);
        if (!modifier) return false;
        return modifier.stacks >= 4;
      },
      getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
      manaCost: 0,
      shouldExhaust: true,
      async onResolve(game, card) {
        const modifier = card.modifiers.get(SpellSlingerCounterModifier);
        if (!modifier) return;
        await modifier.removeStacks(4);
        await card.player.cardManager.draw(1);
        if (card.player.runeManager.has({ wisdom: 2 })) {
          await card.player.manaManager.gain(1);
        }
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<HeroCard>('erina-violet-witch', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter: event =>
              event.data.card.player.equals(card.player) && isSpell(event.data.card),
            async handler() {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Erina, Violet Witch passive triggered.'
                })
              );

              await card.modifiers.add(new SpellSlingerCounterModifier(game, card));
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
