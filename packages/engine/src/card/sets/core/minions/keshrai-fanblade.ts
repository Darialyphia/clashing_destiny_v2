import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isSpell } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';

export const keshraiFanblade: MinionBlueprint = {
  id: 'keshrai-fanblade',
  name: 'Keshrai Fanblade',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger> Enemy spells cost <rt-mana>2</rt-mana> more this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/keshrai-fanblade'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE, AFFINITIES.NEUTRAL],
  manaCost: 5,
  manaSupply: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const aura = new Modifier<MinionCard>('kashrai-fanblade-aura', game, card, {
      mixins: [
        new UntilEndOfTurnModifierMixin(game),
        new CardAuraModifierMixin(game, card, {
          isElligible(candidate) {
            return isSpell(candidate) && candidate.isEnemy(card);
          },
          getModifiers() {
            return [
              new SimpleManacostModifier('keshrai-fanblade-mana-tax', game, card, {
                amount: 2
              })
            ];
          }
        })
      ]
    });

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          await card.modifiers.add(aura);
        }
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
