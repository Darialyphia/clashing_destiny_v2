import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import { HeroInterceptModifier } from '../../../../modifier/modifiers/hero-intercept.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { OnAttackModifier } from '../../../../modifier/modifiers/on-attack.modifier';

export const radiantCelestial: MinionBlueprint = {
  id: 'radiant-celestial',
  name: 'Radiant Celestial',
  cardIconId: 'minions/radiant-celestial',
  description: dedent`
  You need to pay an additional @[mana] 2@ to play this card.
  @Hero Intercept@.
  @On Enter@ and @On Attack@: Heal your hero and all other allied minions for 4.
  `,
  collectable: true,
  unique: false,
  destinyCost: 3,
  speed: CARD_SPEED.FAST,
  atk: 3,
  maxHp: 8,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    game.on(GAME_EVENTS.CARD_DECLARE_PLAY, async event => {
      if (!event.data.card.equals(card)) return;
      const cards = await game.interaction.chooseCards({
        player: card.player,
        label: 'Select cards to pay for this card',
        minChoiceCount: 2,
        maxChoiceCount: 2,
        choices: card.player.cardManager.hand
      });
      for (const c of cards) {
        await c.sendToDestinyZone();
      }
    });

    await card.modifiers.add(new HeroInterceptModifier(game, card, {}));

    const heal = async () => {
      const healTargets = [
        card.player.hero,
        ...card.player.minions.filter(m => !m.equals(card))
      ];
      for (const target of healTargets) {
        await target.heal(4);
      }
    };
    await card.modifiers.add(new OnAttackModifier(game, card, { handler: heal }));
    await card.modifiers.add(new OnEnterModifier(game, card, { handler: heal }));
  },
  async onPlay() {}
};
