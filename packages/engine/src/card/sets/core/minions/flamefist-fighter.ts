import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LingeringDestinyModifier } from '../../../../modifier/modifiers/lingering-destiny.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isSpell } from '../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.entity';

export const flamefistFighter: MinionBlueprint = {
  id: 'flamefist-fighter',
  name: 'Flamefist Fighter',
  cardIconId: 'minions/flamefist-fighter',
  description: `When you play a Fire spell, This gains +1 @[attack]@ this turn.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.COMMON,
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
      new Modifier<MinionCard>('flamefist-fighter-spellwatch', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            handler: async event => {
              const playedCard = event.data.card;
              if (!playedCard.isAlly(card)) return;
              if (!isSpell(playedCard)) return;
              if (playedCard.spellSchool !== SPELL_SCHOOLS.FIRE) return;

              await card.modifiers.add(
                new SimpleAttackBuffModifier(
                  'flamefist-fighter-attack-buff',
                  game,
                  card,
                  { amount: 1, mixins: [new UntilEndOfTurnModifierMixin(game)] }
                )
              );
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
