import { GAME_EVENTS } from '../../../../game/game.events';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isMinion } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const heraldOfSalvation: MinionBlueprint = {
  id: 'herald-of-salvation',
  name: 'Herald of Salvation',
  cardIconId: 'unit-herald-of-salvation',
  description: `@[level] 3+@ : @On Enter@: The next time another allied minion is destroyed, send it to your Destiny zone.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 3,
  maxHp: 3,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<MinionCard>;

    await card.modifiers.add(
      new OnEnterModifier(game, card, () => {
        if (!levelMod.isActive) return;

        const unsub = game.on(GAME_EVENTS.CARD_AFTER_DESTROY, ({ data }) => {
          if (!data.card.player.equals(card.player)) return;
          if (!isMinion(data.card)) return;
          if (!data.card.equals(card)) return;

          unsub();
          card.sendToDestinyZone();
        });
      })
    );
  },
  async onPlay() {}
};
