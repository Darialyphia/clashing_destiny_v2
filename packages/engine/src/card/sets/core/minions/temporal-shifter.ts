import { GAME_PHASES } from '../../../../game/game.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.card';

export const temporalShifter: MinionBlueprint = {
  id: 'temporal-shifter',
  name: 'Temporal Shifter',
  cardIconId: 'temporal-shifter',
  description: `@On Enter@: @[level] 2+ bonus@: Your opponent draws cards during their End phase instead of their Draw phase during their next turn.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 4,
  maxHp: 3,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.CHRONO,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = new LevelBonusModifier<MinionCard>(game, card, 2);
    await card.modifiers.add(levelMod);
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        if (!levelMod.isActive) return;

        const cardsToDrawInEndPhase = card.player.opponent.cardsDrawnForTurn;

        const cleanups = await Promise.all([
          card.player.opponent.addInterceptor('cardsDrawnForTurn', () => 0),

          game.on(GAME_EVENTS.AFTER_CHANGE_PHASE, async event => {
            if (
              event.data.to.state === GAME_PHASES.END &&
              game.gamePhaseSystem.turnPlayer.equals(card.player.opponent)
            ) {
              await card.player.opponent.cardManager.draw(cardsToDrawInEndPhase);
            }
          }),

          game.on(GAME_EVENTS.PLAYER_END_TURN, async event => {
            if (event.data.player.equals(card.player.opponent)) {
              for (const cleanup of cleanups) {
                await cleanup();
              }
            }
          })
        ]);
      })
    );
  },
  async onPlay() {}
};
