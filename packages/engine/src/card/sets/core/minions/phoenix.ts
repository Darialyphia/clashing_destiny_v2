import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import type { SpellCard } from '../../../entities/spell.entity';
import { fireball } from '../spells/fireball';
import type { SigilCard } from '../../../entities/sigil.entity';
import { sigilOfImmortalFlame } from '../sigils/sigil-of-immortal-flame';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';

export const phoenix: MinionBlueprint = {
  id: 'phoenix',
  name: 'Phoenix',
  cardIconId: 'minions/phoenix',
  description: dedent`
  @On Enter@ : Put a @${fireball.name}@ in your hand.
  @On Destroy@: Play a @${sigilOfImmortalFlame.name}@ on this space.
  `,
  collectable: true,
  unique: false,
  manaCost: 5,
  atk: 4,
  maxHp: 4,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: SPELL_SCHOOLS.FIRE,
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
          const createdCard = await card.player.generateCard<SpellCard>(fireball.id);
          await createdCard.addToHand();
        }
      })
    );

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async (event, modifier, position) => {
          const createdCard = await card.player.generateCard<SigilCard>(
            sigilOfImmortalFlame.id
          );
          await createdCard.playImmediatelyAt(position);
        }
      })
    );
  },
  async onPlay() {}
};
