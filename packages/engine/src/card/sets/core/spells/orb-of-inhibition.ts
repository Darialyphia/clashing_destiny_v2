import { PlayerInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { FreezeModifier } from '../../../../modifier/modifiers/freeze.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyMinionTargetRules } from '../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const orbOfInhibition: SpellBlueprint = {
  id: 'orb-of-inhibition',
  name: 'Orb of Inhibition',
  cardIconId: 'spells/orb-of-inhibition',
  description:
    'Deal 3 damage to your Hero. Until the end of the turn, both heroes lose all Spell Schools.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.FAST,
  spellSchool: null,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  abilities: [],
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    for (const player of game.playerSystem.players) {
      await player.modifiers.add(
        new Modifier('orb-of-inhibition-spell-school-loss', game, card, {
          mixins: [
            new PlayerInterceptorModifierMixin(game, {
              key: 'spellSchools',
              interceptor: () => []
            }),
            new UntilEndOfTurnModifierMixin(game)
          ]
        })
      );
    }
  }
};
