import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { BlitzModifier } from '../../../../modifier/modifiers/blitz.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isSpell } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const arcaneConduit: MinionBlueprint = {
  id: 'arcane-conduit',
  name: 'Arcane Conduit',
  cardIconId: 'unit-arcane-conduit',
  description: `Whenever you play an Arcane Spell, wake up this unit and give it +1@[attack]@ this turn.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 0,
  maxHp: 1,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<MinionCard>('arcane-conduit-listener', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            async handler({ data }) {
              if (!isSpell(data.card)) return;
              if (data.card.affinity !== AFFINITIES.ARCANE) return;
              if (!data.card.player.equals(card.player)) return;
              await card.wakeUp();

              await card.modifiers.add(
                new SimpleAttackBuffModifier<MinionCard>(
                  'arcane-conduit-attack-buff',
                  game,
                  card,
                  {
                    amount: 1,
                    mixins: [new UntilEndOfTurnModifierMixin(game)]
                  }
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
