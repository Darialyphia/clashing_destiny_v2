import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { TidesFavoredModifier } from '../../../../modifier/modifiers/tide-modifier';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { isMinion } from '../../../card-utils';
import { MinionCard } from '../../../entities/minion.entity';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { SimpleManaCostBuffModifier } from '../../../../modifier/modifiers/simple-mana-cost-buff.modifier';

export const poseidonEmperorOfTheSea: MinionBlueprint = {
  id: 'poseidonEmperorOfTheSea',
  name: 'Poseidon, Emperor of the Sea',
  cardIconId: 'unit-poseidon-emperor-of-the-sea',
  description: dedent`
  @Tide (3)@ : your other Water minions have @Rush@ and cost @[mana] 1@ less.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 2,
  maxHp: 4,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const POSEIDON_MANA_COST_DISCOUNT = 'poseidon-mana-cost-discount';

    await card.modifiers.add(
      new Modifier<MinionCard>('poseidon-aura', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new AuraModifierMixin(game, {
            canSelfApply: false,
            isElligible(candidate) {
              const tidesFavored = card.player.hero.modifiers.get(TidesFavoredModifier);
              return (
                candidate.isAlly(card) &&
                isMinion(candidate) &&
                candidate.affinity === AFFINITIES.WATER &&
                tidesFavored?.stacks === 3
              );
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(new RushModifier(game, card, {}));
              await candidate.modifiers.add(
                new SimpleManaCostBuffModifier(POSEIDON_MANA_COST_DISCOUNT, game, card, {
                  amount: -1
                })
              );
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(RushModifier);
              await candidate.modifiers.remove(POSEIDON_MANA_COST_DISCOUNT);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
