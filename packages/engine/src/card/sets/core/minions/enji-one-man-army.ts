import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { CleaveModifier } from '../../../../modifier/modifiers/cleave.modifier';
import { PiercingModifier } from '../../../../modifier/modifiers/percing.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.card';

export const enjiOneManArmy: MinionBlueprint = {
  id: 'enji-one-man-army',
  name: 'Enji, One-Man Army',
  cardIconId: 'unit-enji-one-man-army',
  description: `@Unique@, @Cleave@, @Piercing@.\nIf you have another minion on the board, destroy this.`,
  collectable: true,
  unique: true,
  manaCost: 4,
  atk: 4,
  maxHp: 5,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new PiercingModifier(game, card));
    await card.modifiers.add(new CleaveModifier(game, card));
    await card.modifiers.add(
      new Modifier<MinionCard>('enji-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            canSelfApply: false,
            isElligible(candidate) {
              return (
                card.location === 'board' &&
                candidate.location === 'board' &&
                card.kind === CARD_KINDS.MINION
              );
            },
            async onGainAura() {
              await card.destroy();
            },
            onLoseAura() {}
          })
        ]
      })
    );
  },
  async onPlay() {}
};
