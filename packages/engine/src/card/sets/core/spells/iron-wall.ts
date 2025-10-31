import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleAllyTargetRules } from '../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { InterceptModifier } from '../../../../modifier/modifiers/intercept.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { HeroInterceptModifier } from '../../../../modifier/modifiers/hero-intercept.modifier';
import { VigilantModifier } from '../../../../modifier/modifiers/vigilant.modifier';

export const ironWall: SpellBlueprint = {
  id: 'iron-wall',
  name: 'Iron wall',
  cardIconId: 'spells/iron-wall',
  description: dedent`
  Give an ally minion @Intercept@, @Hero Intercept@ and @Vigilant@ this turn.
  @Warrior Affinity@ : this costs 1 less.
  `,
  collectable: true,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.FLASH,
  spellSchool: null,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  abilities: [],
  tags: [],
  canPlay: singleAllyTargetRules.canPlay,
  getPreResponseTargets(game, card) {
    return singleAllyTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    await target.modifiers.add(
      new InterceptModifier(game, card, {
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
    await target.modifiers.add(
      new HeroInterceptModifier(game, card, {
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
    await target.modifiers.add(
      new VigilantModifier<MinionCard>(game, card, {
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
};
