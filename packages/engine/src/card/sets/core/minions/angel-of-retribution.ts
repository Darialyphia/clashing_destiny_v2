import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { MinionCard } from '../../../entities/minion.entity';
import { CardInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { AbilityDamage } from '../../../../utils/damage';
import { HeroJobAffinityModifier } from '../../../../modifier/modifiers/hero-job-affinity.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const angelOfRetribution: MinionBlueprint = {
  id: 'angel-of-retribution',
  name: 'Angel of Retribution',
  cardIconId: 'minions/angel-of-retribution',
  description: dedent`
  @Paladin Affinity@ : Every time your hero takes damage from an enemy source, reduce the cost of this card by 1 this turn.
  @On Enter@ : Deal 2 damage to all enemies, and heal all allies for 2.
  `,
  collectable: true,
  unique: false,
  destinyCost: 4,
  atk: 4,
  maxHp: 6,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const paladinMod = (await card.modifiers.add(
      new HeroJobAffinityModifier(game, card, HERO_JOBS.PALADIN)
    )) as HeroJobAffinityModifier<MinionCard>;

    await card.modifiers.add(
      new Modifier<MinionCard>('angel-of-retribution-cost-discount', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => paladinMod.isActive),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE,
            handler(event, modifier) {
              if (!event.data.card.equals(card.player.hero)) return;
              if (event.data.source.isAlly(card)) return;
              modifier.addStacks(1);
            }
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_END,
            async handler(e, modifier) {
              await modifier.setStacks(1);
            }
          }),
          new CardInterceptorModifierMixin(game, {
            key: 'destinyCost',
            interceptor(value, ctx, modifier) {
              if (value === null) return value;
              return Math.max(0, value - (modifier.stacks - 1));
            }
          })
        ]
      })
    );
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const enemies = [card.player.opponent.hero, ...card.player.opponent.minions];
          const allies = [card.player.hero, ...card.player.minions];

          for (const enemy of enemies) {
            await enemy.takeDamage(card, new AbilityDamage(3));
          }
          for (const ally of allies) {
            await ally.heal(3);
          }
        }
      })
    );
  },
  async onPlay() {}
};
