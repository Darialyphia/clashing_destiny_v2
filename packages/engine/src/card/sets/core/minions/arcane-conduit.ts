import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { BlitzModifier } from '../../../../modifier/modifiers/blitz.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const arcaneConduit: MinionBlueprint = {
  id: 'arcane-conduit',
  name: 'Arcane Conduit',
  cardIconId: 'unit-arcane-conduit',
  description: `Whenever you play an Arcane Spell, activate this unit and give it +1@[attack]@ this turn.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 0,
  maxHp: 1,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {},
  async onPlay() {}
};
