import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import type { AnyCard } from '../../../entities/card.entity';
import { MinionCard } from '../../../entities/minion.entity';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { CardAfterPlayEvent } from '../../../card.events';

export const arcaneConduit: MinionBlueprint = {
  id: 'arcane-conduit',
  name: 'Arcane Conduit',
  cardIconId: 'minions/arcane-conduit',
  description: dedent`
  When you play a spell, and give it +1 @[attack]@ this turn.
  @[level] 3 Bonus@: When you play a spell, wake up this minion.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: HERO_JOBS.MAGE,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
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
