import type { SigilBlueprint } from '../../../../card-blueprint';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { AbilityDamage } from '../../../../../utils/damage';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { SigilCard } from '../../../../entities/sigil.entity';
import dedent from 'dedent';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const timeBomb: SigilBlueprint = {
  id: 'time-bomb',
  kind: CARD_KINDS.SIGIL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Time Bomb',
  description: dedent`
  @On Destroyed@: deal 1 damage to all enemy minions. If there is another allied Time Bomb in play, exhaust them as well.
  @[lvl] 2 Bonus@: @Echo@.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 2,
  abilities: [],
  maxCountdown: 1,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 2)
    )) as LevelBonusModifier<SigilCard>;

    await card.modifiers.add(
      new EchoModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {
          const enemyMinions = card.player.enemyMinions;

          const hasOtherTimeBomb = card.player.boardSide.sigils.some(sigil => {
            sigil.blueprintId === 'time-bomb' && !sigil.equals(card);
          });
          for (const minion of enemyMinions) {
            await minion.takeDamage(card, new AbilityDamage(1));
            if (hasOtherTimeBomb) {
              await minion.exhaust();
            }
          }
        }
      })
    );
  },
  async onPlay() {}
};
