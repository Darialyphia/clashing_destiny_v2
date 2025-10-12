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
import type { SpellCard } from '../../../entities/spell.entity';

export const flameJuggler: MinionBlueprint = {
  id: 'flame-juggler',
  name: 'Flame Juggler',
  cardIconId: 'minions/flame-juggler',
  description: dedent`
  @On Enter@ : Put a @Fire Bolt@ in your hand.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 3,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: null,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const createdCard = await card.player.generateCard<SpellCard>('fire-bolt');
          await createdCard.addToHand();
        }
      })
    );
  },
  async onPlay() {}
};
