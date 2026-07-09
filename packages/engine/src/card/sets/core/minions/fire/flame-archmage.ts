import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isSpell, singleMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { askMandatoryYesNoQuestion } from '../../../../card-actions-utils';
import { AbilityDamage } from '../../../../../utils/damage';
import { RUNES } from '../../../../../player/player.enums';
import { WhileOnBattlefieldModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { CardEffectTriggeredEvent } from '../../../../card.events';

export const flameArchmage: MinionBlueprint = {
  id: 'flameArchmage',
  name: 'Flame Archmage',
  description: dedent /*html*/ `
  <rt-location locations="battlefield">After you play a Fire spell, you may consume <rt-runes runes="wisdom"></rt-runes> to deal 2 damage to a minion on a battlefield.
  </rt-location>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/flame-archmage'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 5,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('flameArchmage', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter: event =>
              event.data.card.player.equals(card.player) &&
              isSpell(event.data.card) &&
              event.data.card.affinities.includes(AFFINITIES.FIRE),
            async handler() {
              if (!card.player.runeManager.has({ wisdom: 1 })) return;

              const hasTarget = singleMinionTargetRules.canPlay(
                game,
                card,
                minion => minion.isOnBattlefield
              );
              if (!hasTarget) return;

              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: `Flame Archmage effect triggered.`
                })
              );

              const shouldActivate = await askMandatoryYesNoQuestion({
                game,
                card,
                questionId: 'flameArchmage-activation',
                label:
                  'Consume 1 Wisdom rune to deal 2 damage to a minion on the battlefield?',
                aiChoice: 'yes',
                timeoutFallback: 'no'
              });

              if (!shouldActivate) return;

              await card.player.runeManager.remove([RUNES.WISDOM]);

              const result = await singleMinionTargetRules.getTargets({
                game,
                card,
                predicate: minion => minion.isOnBattlefield,
                canCancel: false,
                label: 'Select a minion to deal 2 damage to',
                timeoutFallback: [],
                aiHints: {
                  shouldPick: () => 1
                }
              });
              if (result.cancelled) return;

              const target = result.result.cards[0];
              if (!target) return;

              await target.takeDamage(card, new AbilityDamage(2));
            }
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
