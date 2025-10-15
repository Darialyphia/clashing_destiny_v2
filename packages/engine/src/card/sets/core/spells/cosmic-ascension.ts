import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { isSpell, singleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  HERO_JOBS
} from '../../../card.enums';
import { HeroJobAffinityModifier } from '../../../../modifier/modifiers/hero-job-affinity.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { HeroCard } from '../../../entities/hero.entity';
import { GAME_EVENTS } from '../../../../game/game.events';
import { scry } from '../../../card-actions-utils';
import { SpellDamage } from '../../../../utils/damage';

export const cosmicAscension: SpellBlueprint = {
  id: 'cosmic-ascension',
  name: 'Cosmic Ascension',
  cardIconId: 'spells/cosmic-ascension',
  description: dedent`
  Draw a card into your Destiny Zone. 
  @Sage Affinity@ : This turn, after you play a spell, @Scry 1@. If the scryed card was a spell, banish it and deal 1 damage to an enemy.
  `,
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new HeroJobAffinityModifier(game, card, HERO_JOBS.SAGE));
  },
  async onPlay(game, card) {
    await card.player.cardManager.drawIntoDestinyZone(1);
    const sageMod = card.modifiers.get(HeroJobAffinityModifier);

    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('cosmic-ascension-scry', game, card, {
        mixins: [
          new UntilEndOfTurnModifierMixin(game),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            handler: async event => {
              if (!event.data.card.isAlly(card)) return;
              if (!isSpell(event.data.card)) return;
              if (sageMod?.isActive) {
                const result = await scry(game, card, 1);
                if (!isSpell(result.cards[0])) return;
                await result.cards[0].sendToBanishPile();
                if (!singleEnemyTargetRules.canPlay(game, card)) return;
                const targets = await singleEnemyTargetRules.getPreResponseTargets(
                  game,
                  card,
                  { type: 'card', card }
                );
                if (!targets.length) return;
                const target = targets[0];
                await target.takeDamage(card, new SpellDamage(1, card));
              }
            }
          })
        ]
      })
    );
  }
};
