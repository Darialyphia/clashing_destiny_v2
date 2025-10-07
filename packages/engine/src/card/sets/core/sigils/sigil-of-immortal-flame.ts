import dedent from 'dedent';
import type { SigilBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import type { MinionCard } from '../../../entities/minion.entity';

export const sigilOfImmortalFlame: SigilBlueprint = {
  id: 'sigil-of-immortal-flame',
  name: 'Sigil of Immortal Flame',
  cardIconId: 'sigils/sigil-of-immortal-flame',
  description: dedent`
  @On Destroy@ : Summon a @Phoenix@ in this space.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  maxCountdown: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.SIGIL,
  spellSchool: SPELL_SCHOOLS.FIRE,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async (event, modifier, position) => {
          const createdCard = await card.player.generateCard<MinionCard>('phoenix');
          await createdCard.playImmediatelyAt(position);
        }
      })
    );
  },
  async onPlay() {}
};
