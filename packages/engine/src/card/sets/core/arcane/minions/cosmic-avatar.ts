import dedent from 'dedent';
import { OverwhelmModifier } from '../../../../../modifier/modifiers/overwhelm.modifier';
import { PrideModifier } from '../../../../../modifier/modifiers/pride.modifier';
import { HinderedModifier } from '../../../../../modifier/modifiers/hindered.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { PreemptiveStrikeModifier } from '../../../../../modifier/modifiers/preemptive-strike.mofier';
import { getEmpowerStacks } from '../../../../card-actions-utils';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import { AbilityDamage } from '../../../../../utils/damage';

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
    Depending on your hero's @Empower@ stacks:
    1: @Preemptive Strike@.
    2-3: @Overwhelm@ and +2 Atk.
    4+: @On Attack@: Deal 3 damage to all enemies.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  art: {
    default: {
      foil: {
        oil: true,
        lightGradient: true,
        scanlines: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'minions/cosmic-avatar-bg',
      main: 'minions/cosmic-avatar',
      breakout: 'minions/cosmic-avatar-breakout',
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

    await card.modifiers.add(
      new PreemptiveStrikeModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)]
      })
    );
    await card.modifiers.add(
      new OverwhelmModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) >= 2)]
      })
    );
    await card.modifiers.add(
      new SimpleAttackBuffModifier('cosmic-avatar-empower-atk-buff', game, card, {
        amount: 2,
        mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) >= 2)]
      })
    );

    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          for (const enemy of card.player.allEnemies) {
            await enemy.takeDamage(card, new AbilityDamage(3));
          }
        },
        mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) >= 4)]
      })
    );
  },
  async onPlay() {}
};
