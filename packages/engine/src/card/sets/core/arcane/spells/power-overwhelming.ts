import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { UnpreventableDamage } from '../../../../../utils/damage';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { HeroCard } from '../../../../entities/hero.entity';
import type { MinionCard } from '../../../../entities/minion.entity';

export const powerOverwhelming: SpellBlueprint = {
  id: 'power-overwhelming',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Power Overwhelming',
  description: dedent`This turn, when your hero becomes @Empowered@, Deal 2 @True Damage@ to an enemy.`,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'spells/power-overwhelming-bg',
      main: 'spells/power-overwhelming',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 1,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('power-overwhelming', game, card, {
        mixins: [
          new UntilEndOfTurnModifierMixin(game),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.MODIFIER_AFTER_APPLIED,
            async handler(event) {
              if (!(event.data instanceof EmpowerModifier)) return;
              if (!event.data.target.equals(card.player.hero)) return;

              const targets = [
                card.player.opponent.hero,
                ...card.player.opponent.minions
              ].filter(c => c.canBeTargeted(card));

              if (targets.length === 0) return;
              const [selected] = await game.interaction.selectCardsOnBoard<
                MinionCard | HeroCard
              >({
                player: card.player,
                origin: { type: 'card', card },
                isElligible(candidate, selectedCards) {
                  if (selectedCards.length > 0) return false;
                  return targets.some(t => t.equals(candidate));
                },
                canCommit(selectedCards) {
                  return selectedCards.length === 1;
                },
                isDone(selectedCards) {
                  return selectedCards.length === 1;
                }
              });

              await selected.takeDamage(card, new UnpreventableDamage(2));
            }
          })
        ]
      })
    );
  }
};
