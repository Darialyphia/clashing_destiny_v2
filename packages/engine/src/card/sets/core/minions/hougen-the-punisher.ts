import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { AbilityDamage } from '../../../../utils/damage';
import { UniqueModifier } from '../../../../modifier/modifiers/unique.modifier';

export const hougenThePunisher: MinionBlueprint = {
  id: 'hougen-the-punisher',
  name: 'Hougen, the Punisher',
  cardIconId: 'minions/hougen-the-punisher',
  description: dedent`
  @Unique@.
  @On Enter@ : Deal 3 damage to the minion in front of this.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 4,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: null,
  job: null,
  speed: CARD_SPEED.FAST,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new UniqueModifier(game, card));
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const target = card.slot?.inFront?.minion;
          if (!target) return;
          await target.takeDamage(card, new AbilityDamage(3));
        }
      })
    );
  },
  async onPlay() {}
};
