import type { MinionPosition } from '../../../../game/interactions/selecting-minion-slots.interaction';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { isMinion } from '../../../card-utils';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { ArtifactCard } from '../../../entities/artifact.entity';

export const firebrand: ArtifactBlueprint = {
  id: 'firebrand',
  name: 'Firebrand',
  cardIconId: 'firebrand',
  description: 'While this is equiped, your minions have @Burn@.',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 3,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.FIRE,
  atk: 3,
  durability: 3,
  subKind: ARTIFACT_KINDS.WEAPON,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    const burnAura = new Modifier<ArtifactCard>('firebrand-burn-aura', game, card, {
      mixins: [
        new AuraModifierMixin(game, {
          canSelfApply: false,
          isElligible(candidate) {
            if (!isMinion(candidate)) return false;
            if (candidate.isAlly(card)) return false;
            if (candidate.modifiers.has(BurnModifier)) return false;

            return candidate?.location === 'board';
          },
          async onGainAura(candidate) {
            await candidate.modifiers.add(new BurnModifier(game, card));
          },
          async onLoseAura(candidate) {
            await candidate.modifiers.remove(BurnModifier);
          }
        })
      ]
    });

    await card.modifiers.add(
      new WhileOnBoardModifier('firebrand', game, card, {
        async onActivate() {
          await card.modifiers.add(burnAura);
        },
        async onDeactivate() {
          await card.modifiers.remove(burnAura);
        }
      })
    );
  },
  async onPlay() {}
};
