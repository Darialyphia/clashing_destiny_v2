import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import type { SpellCard } from '../../../entities/spell.entity';
import { cardsInAllyDiscardPile, isSpell } from '../../../card-utils';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { MinionCard } from '../../../entities/minion.entity';
import { GAME_EVENTS } from '../../../../game/game.events';
import { EFFECT_TYPE } from '../../../../game/game.enums';
import { empower } from '../../../card-actions-utils';

export const rulerOfTempestFire: MinionBlueprint = {
  id: 'ruler-of-tempest-fire',
  name: 'Ruler of Tempest Fire',
  cardIconId: 'minions/ruler-of-tempest-fire',
  description: dedent`
  When you play a @Fire Bolt@, @Empower 2@.
  `,
  collectable: true,
  unique: false,
  destinyCost: 3,
  atk: 2,
  maxHp: 6,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: SPELL_SCHOOLS.FIRE,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [
    {
      id: 'ruler-of-tempest-fire-ability',
      description:
        '@[mana] 1@ Banish a Fire Spell in your discard pile : Add a @fleeting@ @Fire Bolt@ to your hand.',
      label: '@[mana] 1@Banish Fire Spell',
      canUse(game, card) {
        return cardsInAllyDiscardPile.canPlay(game, card, {
          predicate: c => isSpell(c) && c.spellSchool === SPELL_SCHOOLS.FIRE
        });
      },
      async getPreResponseTargets(game, card) {
        const [cardToBanish] =
          await cardsInAllyDiscardPile.getPreResponseTargets<SpellCard>(game, card, {
            player: card.player,
            label: 'Select a Fire Spell to banish',
            predicate: c => isSpell(c) && c.spellSchool === SPELL_SCHOOLS.FIRE
          });
        cardToBanish.sendToBanishPile();

        return [];
      },
      manaCost: 1,
      shouldExhaust: false,
      speed: CARD_SPEED.SLOW,
      async onResolve(game, card) {
        const createdCard = await card.player.generateCard<SpellCard>('fire-bolt');
        await createdCard.addToHand();
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<MinionCard>('ruler-of-tempest-fire-empower', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.EFFECT_CHAIN_BEFORE_EFFECT_RESOLVED,
            handler: event => {
              if (event.data.effect.type !== EFFECT_TYPE.CARD) return;
              if (event.data.effect.source.blueprint.id !== 'fire-bolt') return;
              empower(game, card, 2);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
