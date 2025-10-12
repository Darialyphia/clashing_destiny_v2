import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
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
import { MinionCard } from '../../../entities/minion.entity';

export const arcaneConduit: MinionBlueprint = {
  id: 'arcane-conduit',
  name: 'Arcane Conduit',
  cardIconId: 'minions/arcane-conduit',
  description: `When you play a spell, wake up this unit and give it +1 @[attack]@ this turn.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 1,
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
    await card.modifiers.add(
      new Modifier<MinionCard>('arcane-conduit-spellwatch', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            handler: async event => {
              if (!event.data.card.isAlly(card)) return;
              if (event.data.card.kind !== CARD_KINDS.SPELL) return;

              await card.wakeUp();
              await card.modifiers.add(
                new SimpleAttackBuffModifier('arcane-conduit-bugg', game, card, {
                  name: 'Arcane Conduit',
                  amount: 1
                })
              );
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
