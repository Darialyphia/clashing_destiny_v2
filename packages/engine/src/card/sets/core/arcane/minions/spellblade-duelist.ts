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
import { PreemptiveStrikeModifier } from '../../../../../modifier/modifiers/preemptive-strike.mofier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { getEmpowerStacks } from '../../../../card-actions-utils';
import { StealthModifier } from '../../../../../modifier/modifiers/stealth.modifier';

export const spellbladeDuelist: MinionBlueprint = {
  id: 'spellblade-duelist',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Spellblade Duelist',
  description: dedent`
  This has @Preemptive Strike@ and @Stealth@ as long as your hero is @Empowered@ .
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        glitter: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'minions/spellblade-duellist-bg',
      main: 'minions/spellblade-duellist',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 3,
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
      new StealthModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)]
      })
    );
  },
  async onPlay() {}
};
