import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { ShieldModifier } from '../../../../modifier/modifiers/shield.modifier';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { MinionCard } from '../../../entities/minion.entity';
import { IntimidateModifier } from '../../../../modifier/modifiers/intimidate.modifier';

export const argeonHighmane: MinionBlueprint = {
  id: 'argeon-highmane',
  name: 'Argeon Highmane',
  description: dedent /*html*/ `
  <rt-keyword>Shield</rt-keyword>.
  <rt-location locations="battlefield"></rt-location> Your minions at that battlefield have <rt-keyword>Intimidate 2</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/argeon-highmane'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  manaCost: 5,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 6,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new ShieldModifier(game, card));
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('argeon-highmane-aura', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return candidate.isAlly(card) && candidate.location === card.location;
            },
            getModifiers() {
              return [new IntimidateModifier(game, card, { level: 2 })];
            }
          })
        ]
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
