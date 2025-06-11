import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { TalentBlueprint } from '../../../card-blueprint';
import { isSpell } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import type { SpellCard } from '../../../entities/spell.entity';
import { mage } from '../heroes/mage';

export const fireStudies: TalentBlueprint = {
  id: 'fire-studies',
  name: 'Fire Studies',
  cardIconId: 'talent-fire-studies',
  description: 'Your first Fire spell each turn costs 1 less mana.',
  affinity: AFFINITIES.FIRE,
  collectable: true,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  destinyCost: 1,
  level: 1,
  heroId: mage.id,
  rarity: RARITIES.RARE,
  kind: CARD_KINDS.TALENT,
  setId: CARD_SETS.CORE,
  tags: [],
  async onInit() {},
  async onPlay(game, card) {
    const interceptor = (manaCost: number | null) => {
      return Math.max(0, manaCost! - 1);
    };

    const aura = new Modifier<HeroCard>('fire-studies', game, card, {
      mixins: [
        new AuraModifierMixin(game, {
          canSelfApply: false,
          isElligible(candidate) {
            if (candidate.location !== 'hand') return false;
            if (!candidate.player.equals(card.player)) return false;
            if (!isSpell(candidate)) return false;
            if (candidate.affinity !== AFFINITIES.FIRE) return false;

            const spellsPlayedThisTurn =
              card.player.cardTracker.getCardsPlayedThisTurnOfKind(CARD_KINDS.SPELL);
            return spellsPlayedThisTurn.length === 0;
          },
          async onGainAura(candidate) {
            await (candidate as SpellCard).addInterceptor('manaCost', interceptor);
          },
          async onLoseAura(candidate) {
            await (candidate as SpellCard).removeInterceptor('manaCost', interceptor);
          }
        })
      ]
    });

    await card.player.hero.modifiers.add(aura);
  }
};
