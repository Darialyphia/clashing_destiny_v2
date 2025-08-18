import dedent from 'dedent';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.entity';
import { OnKillModifier } from '../../../../modifier/modifiers/on-kill.modifier';
import { PrideModifier } from '../../../../modifier/modifiers/pride.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const enjiOneManArmy: MinionBlueprint = {
  id: 'enji-one-man-army',
  name: 'Enji, One-Man Army',
  cardIconId: 'unit-enji-one-man-army',
  description: dedent`@Pride(3).
  @On Kill@: wake this up.
  If you have another minion on the board, destroy this.
  `,
  collectable: true,
  unique: false,
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
    await card.modifiers.add(new PrideModifier(game, card, 3));

    await card.modifiers.add(
      new Modifier<MinionCard>('enji-aura', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new AuraModifierMixin(game, {
            canSelfApply: false,
            isElligible(candidate) {
              const ok =
                candidate.location === 'board' &&
                candidate.kind === CARD_KINDS.MINION &&
                candidate.location === 'board' &&
                candidate.player.equals(card.player) &&
                !candidate.equals(card);

              return ok;
            },
            async onGainAura() {
              await card.destroy();
            },
            onLoseAura() {}
          })
        ]
      })
    );

    await card.modifiers.add(
      new OnKillModifier(game, card, {
        async handler() {
          await card.wakeUp();
        }
      })
    );
  },
  async onPlay() {}
};
