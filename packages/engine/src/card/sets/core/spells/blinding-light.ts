import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.entity';
import { EchoedDestinyModifier } from '../../../../modifier/modifiers/echoed-destiny.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const blindingLight: SpellBlueprint = {
  id: 'blinding-light',
  name: 'Blinding Light',
  cardIconId: 'spells/blinding-light',
  description: dedent`
  Set an enemy minion attack to 0 this turn.
  @Echoed Destiny@`,
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: singleEnemyTargetRules.canPlay,
  getPreResponseTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit(game, card) {
    await card.modifiers.add(new EchoedDestinyModifier(game, card, {}));
  },
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    await target.modifiers.add(
      new Modifier<MinionCard>('blinding-light', game, card, {
        mixins: [
          new MinionInterceptorModifierMixin(game, {
            key: 'atk',
            interceptor: () => 0
          }),
          new UntilEndOfTurnModifierMixin(game)
        ]
      })
    );
  }
};
