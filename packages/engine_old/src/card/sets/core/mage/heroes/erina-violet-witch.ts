import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { HexedModifier } from '../../../../../modifier/modifiers/hexed.modifier';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleHealthBuffModifier } from '../../../../../modifier/modifiers/simple-health-buff.modifier';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  defaultCardTint,
  JOBS
} from '../../../../card.enums';

export const erinaVioletWitch: HeroBlueprint = {
  id: 'erina-violet-witch',
  kind: CARD_KINDS.HERO,
  collectable: true,
  name: 'Erina, Violet Witch',
  description: '',
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('placeholder', defaultCardTint),
  jobs: [JOBS.MAGE],
  tags: [],

  atk: 2,
  retaliation: 0,
  maxHp: 25,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler(event) {
          const { target } = event.data;
          if (!isMinion(target)) return;
          if (!target.modifiers.has(HexedModifier)) return;

          await target.modifiers.addMany(
            new SimpleAttackBuffModifier('erina-violet-witch-atk-debuff', game, card, {
              amount: -1,
              mixins: [new UntilEndOfTurnModifierMixin(game)]
            }),
            new SimpleHealthBuffModifier('erina-violet-witch-hp-debuff', game, card, {
              amount: -1,
              mixins: [new UntilEndOfTurnModifierMixin(game)]
            })
          );
        }
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldAttack: () => 1,
    shouldPlay: () => 1
  }
};
