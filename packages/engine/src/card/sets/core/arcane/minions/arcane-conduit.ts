import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import type { CardAfterPlayEvent } from '../../../../card.events';
import type { AnyCard } from '../../../../entities/card.entity';
import type { MinionCard } from '../../../../entities/minion.entity';

export const arcaneConduit: MinionBlueprint = {
  id: 'arcane-conduit',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Arcane Conduit',
  description:
    'When you play an Arcane spell, this gains +1 ATK until the end of turn @[lvl] 3 Bonus@: wake up this minion.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
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
      bg: 'minions/arcane-conduit-bg',
      main: 'minions/arcane-conduit',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<MinionCard>;

    const onCardPlayed = async (event: CardAfterPlayEvent) => {
      if (!event.data.card.isAlly(card)) return;
      if (event.data.card.kind !== CARD_KINDS.SPELL) return;

      await card.modifiers.add(
        new SimpleAttackBuffModifier<MinionCard>(
          'arcane-conduit-attack-buff',
          game,
          card,
          {
            name: 'Arcane Conduit',
            amount: 1,
            mixins: [new UntilEndOfTurnModifierMixin<AnyCard>(game)]
          }
        )
      );
      if (levelMod.isActive) {
        await card.wakeUp();
      }
    };

    await card.modifiers.add(
      new Modifier<MinionCard>('arcane-conduit-spellwatch', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            handler: onCardPlayed
          })
        ]
      })
    );
  },
  async onPlay() {}
};
