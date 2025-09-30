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
import { fireBolt } from '../spells/fire-bolt';

export const flameJuggler: MinionBlueprint = {
  id: 'flame-juggler',
  name: 'Flame Juggler',
  cardIconId: 'minions/flame-juggler',
  description: dedent`
  @On Enter@ : Put a @${fireBolt.name}@ in your hand.
  @[level] 2+ bonus@: Your @${fireBolt.name}@ have Warp speed.
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
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const createdCard = await card.player.generateCard<SpellCard>(fireBolt.id);
          await createdCard.addToHand();
        }
      })
    );
  },
  async onPlay() {}
};
