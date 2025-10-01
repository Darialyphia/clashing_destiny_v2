import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { isMinion } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { Player } from '../../../../player/player.entity';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';

export const flamingFrenzy: SpellBlueprint = {
  id: 'flaming-frenzy',
  name: 'Flaming Frenzy',
  cardIconId: 'spells/flaming-frenzy',
  description: dedent`
  This must be the first card you play this turn. 
  This turn, all minions have +1 @[attack]@.
  `,
  collectable: true,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.FIRE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: (game, card) => {
    // must be the first card played this turn
    return card.player.cardTracker.cardsPlayedThisGameTurn.length === 0;
  },
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    const FLAMING_FRENZY_AURA_ID = 'flaming-frenzy-aura';
    await card.player.modifiers.add(
      new Modifier<Player>('flaming-frenzy', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            isElligible(candidate) {
              return isMinion(candidate) && candidate.location === 'board';
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(
                new SimpleAttackBuffModifier(FLAMING_FRENZY_AURA_ID, game, card, {
                  amount: 1
                })
              );
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(FLAMING_FRENZY_AURA_ID);
            }
          })
        ]
      })
    );
  }
};
