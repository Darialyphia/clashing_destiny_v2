import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { multipleEnemyTargetRules, singleAllyTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.entity';

export const manaShield: SpellBlueprint<MinionCard | HeroCard> = {
  id: 'mana-shield',
  name: 'Mana Shield',
  cardIconId: 'spell-mana-shield',
  description:
    'Prevent the next 1 + @[spellpower]@ damage dealt to target ally this turn. Draw a card in your Destiny zone.',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: singleAllyTargetRules.canPlay,
  getPreResponseTargets: singleAllyTargetRules.getPreResponseTargets,
  async onInit() {},
  async onPlay(game, card, [target]) {
    await (target as MinionCard).modifiers.add(
      new Modifier<MinionCard>('mana-shield', game, card, {
        name: 'Mana Shield',
        description: 'Prevent the next 1 + [spellpower] damage dealt to this',
        icon: 'keyword-mana-shield',
        mixins: [
          new UntilEndOfTurnModifierMixin(game),
          new UnitInterceptorModifierMixin(game, {
            key: 'receivedDamage',
            interceptor: value => {
              const maxMitigation = 1 + card.player.hero.spellPower;
              return Math.max(0, value - maxMitigation);
            }
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.MINION_AFTER_TAKE_DAMAGE,
            handler: async (event, modifier) => {
              if (!event.data.card.equals(target)) return;
              await modifier.target.modifiers.remove(modifier);
            }
          })
        ]
      })
    );

    await card.player.cardManager.drawIntoDestinyZone(1);
  }
};
