import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.card';

export const luminescentMystic: MinionBlueprint = {
  id: 'luminescent-mystic',
  name: 'Luminescent Mystic',
  cardIconId: 'unit-luminescent-mystic',
  description: `@On Enter@ : Give adjacent allied minions +1 @[health]@.\n@[level] 4+@ : Give them +2 @[health]@ instead.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 1,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = new LevelBonusModifier<MinionCard>(game, card, 4);
    await card.modifiers.add(levelMod);

    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        const adjacentMinions = card.slot?.adjacentMinions ?? [];
        for (const minion of adjacentMinions) {
          await minion.modifiers.add(
            new SimpleHealthBuffModifier('luminescent-mystic-health-buff', game, card, {
              amount: levelMod.isActive ? 2 : 1,
              name: 'Luminescent Mystic Health Buff'
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
