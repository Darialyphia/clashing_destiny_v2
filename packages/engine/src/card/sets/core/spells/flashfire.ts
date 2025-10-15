import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { isMinion, singleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { ReactionModifier } from '../../../../modifier/modifiers/reaction.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';

export const flashfire: SpellBlueprint = {
  id: 'flashfire',
  name: 'Flashfire',
  cardIconId: 'spells/flashfire',
  description: dedent`
  @Reaction@. 
  Deal 2 damage to the next minion summoned during this card chain. If I has an @On Enter@ effect, deal 2 damage to the enemy hero as well
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.FIRE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  abilities: [],
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new ReactionModifier(game, card));
  },
  async onPlay(game, card) {
    const stop = game.on(GAME_EVENTS.MINION_SUMMONED, async event => {
      await event.data.card.takeDamage(card, new SpellDamage(2, card));
      if (!event.data.card.modifiers.has(OnEnterModifier)) return;

      await event.data.card.player.opponent.hero.takeDamage(
        card,
        new SpellDamage(2, card)
      );
    });

    await game.once(GAME_EVENTS.EFFECT_CHAIN_AFTER_EFFECT_RESOLVED, stop);
  }
};
