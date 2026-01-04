import dedent from 'dedent';
import { OnHitModifier } from '../../../../../modifier/modifiers/on-hit.modifier';
import { OverwhelmModifier } from '../../../../../modifier/modifiers/overwhelm.modifier';
import { PrideModifier } from '../../../../../modifier/modifiers/pride.modifier';
import { HinderedModifier } from '../../../../../modifier/modifiers/hindered.modifier';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { PreemptiveStrikeModifier } from '../../../../../modifier/modifiers/preemptive-strike.mofier';
import { GAME_EVENTS } from '../../../../../game/game.events';

export const cosmicAvatar: MinionBlueprint = {
  id: 'cosmic-avatar',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Cosmic Avatar',
  description: dedent`
    @Pride 3@, @Hindered 2@.
    @On Attack@: You may @Empower 2@. If you don't, this gains @Preemptive Strike@ and @Overwhelm@ for this attack.
  `,
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
      bg: 'minions/cosmic-avatar-bg',
      main: 'minions/cosmic-avatar',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 4,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new PrideModifier(game, card, 3));
    await card.modifiers.add(new HinderedModifier(game, card, 2));

    let isBuffed = false;
    await card.modifiers.add(
      new OverwhelmModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => isBuffed)]
      })
    );
    await card.modifiers.add(
      new PreemptiveStrikeModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => isBuffed)]
      })
    );

    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          const answer = await game.interaction.askQuestion({
            player: card.player,
            source: card,
            questionId: `cosmic-avatar-empower-${card.id}`,
            label: `Empower 2, or gain Preemptive Strike and Overwhelm for this attack ?`,
            minChoiceCount: 1,
            maxChoiceCount: 1,
            choices: [
              { id: 'empower', label: 'Empower' },
              { id: 'buff', label: `Gain Preemptive Strike and Overwhelm` }
            ]
          });

          if (answer === 'empower') {
            await card.player.hero.modifiers.add(
              new EmpowerModifier(game, card, { amount: 2 })
            );
          } else {
            isBuffed = true;
            game.once(GAME_EVENTS.AFTER_RESOLVE_COMBAT, event => {
              if (event.data.attacker.equals(card)) {
                isBuffed = false;
              }
            });
          }
        }
      })
    );
  },
  async onPlay() {}
};
