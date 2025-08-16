import { CleaveModifier } from '../../../../modifier/modifiers/cleave.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { OnKillModifier } from '../../../../modifier/modifiers/on-kill.modifier';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.entity';

export const pyreArchfiend: MinionBlueprint = {
  id: 'pyre-archfiend',
  name: 'Pyre Archfiend',
  cardIconId: 'unit-pyre-archfiend',
  description: `@Rush@, @Cleave@.\n@[level] 3+ bonus@ : @On Kill@ : deal 2 damage to the enemy Hero.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 3,
  maxHp: 2,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = new LevelBonusModifier<MinionCard>(game, card, 3);
    await card.modifiers.add(levelMod);
    await card.modifiers.add(new CleaveModifier(game, card));
    await card.modifiers.add(new RushModifier(game, card, {}));
    await card.modifiers.add(
      new OnKillModifier(game, card, {
        handler: async () => {
          if (levelMod.isActive) {
            await card.player.opponent.hero.takeDamage(card, new AbilityDamage(2));
          }
        }
      })
    );
  },
  async onPlay() {}
};
