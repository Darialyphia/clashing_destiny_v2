import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { HeroBlueprint } from '../../../card-blueprint';
import { isMinion, isSpell, singleEmptyAllySlot } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import { Modifier } from '../../../../modifier/modifier.entity';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { MinionCard } from '../../../entities/minion.entity';
import { SimpleMinionStatsModifier } from '../../../../modifier/modifiers/simple-minion-stats.modifier';
import { EchoModifier } from '../../../../modifier/modifiers/echo.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';

export const erinaLv3: HeroBlueprint = {
  id: 'erina-lv3',
  name: 'Erina, Arcane Weaver',
  description: dedent`
  @Erina Lineage@.
  Your Spells have @Echo@.
  Every 3 spells you play during a turn, draw a card.
   `,
  cardIconId: 'heroes/erina-lv3',
  kind: CARD_KINDS.HERO,
  level: 3,
  destinyCost: 3,
  speed: CARD_SPEED.SLOW,
  jobs: [HERO_JOBS.MAGE, HERO_JOBS.SAGE],
  spellSchools: [SPELL_SCHOOLS.WATER, SPELL_SCHOOLS.AIR, SPELL_SCHOOLS.ARCANE],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  unique: false,
  lineage: 'erina',
  spellPower: 0,
  atk: 0,
  maxHp: 24,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier('erina-lv3-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            isElligible(candidate) {
              return candidate.isAlly(card) && isSpell(candidate);
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(new EchoModifier(game, card));
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(EchoModifier);
            }
          })
        ]
      })
    );

    await card.modifiers.add(
      new Modifier<HeroCard>('erina-lv3-spellwatch', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            handler: async event => {
              if (!event.data.card.player.equals(card.player)) return;
              if (!isSpell(event.data.card)) return;
              const spellCountThisTurn =
                card.player.cardTracker.getCardsPlayedThisGameTurnOfKind(
                  CARD_KINDS.SPELL
                ).length;

              if (spellCountThisTurn > 0 && spellCountThisTurn % 3 === 0) {
                await card.player.cardManager.draw(1);
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
