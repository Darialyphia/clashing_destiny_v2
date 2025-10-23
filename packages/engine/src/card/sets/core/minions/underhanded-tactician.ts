import { GAME_PHASES } from '../../../../game/game.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.entity';

export const underhandedTactician: MinionBlueprint = {
  id: 'underhandedTactician',
  name: 'Underhanded Tactician',
  cardIconId: 'minions/underhanded-tactician',
  description: `Whenever a player draws outside of the Draw phase, they take 1 damage.`,
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.FAST,
  atk: 3,
  maxHp: 4,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<MinionCard>('underhanded-tactician-draw-damage', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.PLAYER_AFTER_DRAW,
            async handler(event) {
              if (game.gamePhaseSystem.getContext().state === GAME_PHASES.DRAW) return;
              await event.data.player.hero.takeDamage(card, new AbilityDamage(1));
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
