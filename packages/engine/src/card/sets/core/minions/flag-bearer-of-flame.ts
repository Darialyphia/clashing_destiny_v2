import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.card';

export const flagBearerOfFlame: MinionBlueprint = {
  id: 'flagBearerOfFlame',
  name: 'Flag Bearer of Flame',
  cardIconId: 'flag-bearer-of-flame',
  description: `The ally in front of this minion has +1 / +0`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    const attackBuff = new SimpleAttackBuffModifier(
      'flag-bearer-of-flame-attack-buff',
      game,
      card,
      {
        amount: 1
      }
    );

    const aura = new Modifier<MinionCard>('flag-bearer-of-flame-aura', game, card, {
      mixins: [
        new AuraModifierMixin(game, {
          canSelfApply: false,
          isElligible(candidate) {
            return card.slot?.inFront?.equals(candidate) ?? false;
          },
          async onGainAura(candidate) {
            await candidate.modifiers.add(attackBuff);
          },
          async onLoseAura(candidate) {
            await candidate.modifiers.remove(attackBuff);
          }
        })
      ]
    });

    await card.modifiers.add(
      new WhileOnBoardModifier('flag-bearer-of-flame', game, card, {
        async onActivate() {
          await card.modifiers.add(aura);
        },
        async onDeactivate() {
          await card.modifiers.remove(aura);
        }
      })
    );
  },
  async onPlay() {}
};
