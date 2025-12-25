import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { PreemptiveStrikeModifier } from '../../../../../modifier/modifiers/preemptive-strike.mofier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { getEmpowerStacks } from '../../../../card-actions-utils';

export const spellbladeDuelist: MinionBlueprint = {
  id: 'spellblade-duelist',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Spellblade Duelist',
  description: dedent`
  This has @Preemptive Strike@ and +1 ATK as long as your hero is @Empowered@ .
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
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
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new PreemptiveStrikeModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)]
      })
    );

    await card.modifiers.add(
      new SimpleAttackBuffModifier('spellblade-duelist-attack-buff', game, card, {
        amount: 1,
        mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)]
      })
    );
  },
  async onPlay() {}
};


