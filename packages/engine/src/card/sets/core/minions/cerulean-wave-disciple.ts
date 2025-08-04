import dedent from 'dedent';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { DoubleAttackModifier } from '../../../../modifier/modifiers/double-attack.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { TauntModifier } from '../../../../modifier/modifiers/taunt.modifier';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';

export const ceruleanWaveDisciple: MinionBlueprint = {
  id: 'cerulean-wave-disciple',
  name: 'Cerulean Wave Disciple',
  cardIconId: 'unit-cerulean-wave-disciple',
  description: dedent`
    @Taunt@.
    @On Death@ : Draw a card.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 0,
  maxHp: 4,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new TauntModifier(game, card, {}));
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          await card.player.cardManager.draw(1);
        }
      })
    );
  },
  async onPlay() {}
};
