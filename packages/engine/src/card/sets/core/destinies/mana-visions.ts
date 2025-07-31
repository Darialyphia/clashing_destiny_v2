import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { scry } from '../../../card-actions-utils';
import type {
  Ability,
  DestinyBlueprint,
  PreResponseTarget
} from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';

export const manaVisions: DestinyBlueprint = {
  id: 'mana-visions',
  name: 'Mana Visions',
  cardIconId: 'talent-mana-visions',
  description:
    '@[exhaust]@ @[mana] 1@ : @Scry 1@, then draw a card. You cannot play spells this turn. You cannot use this ability if you have already played a spell this turn.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 1,
  abilities: [
    {
      id: 'mana-visions-ability',
      manaCost: 1,
      shouldExhaust: true,
      description: '@Scry 1@, then draw a card. You cannot play spells this turn.',
      label: '@[exhaust]@ : @Scry 1@, draw 1',
      getPreResponseTargets: async () => [],
      canUse: (game, card) => {
        return (
          card.player.cardTracker.getCardsPlayedThisTurnOfKind(CARD_KINDS.SPELL)
            .length === 0
        );
      },
      onResolve: async (game, card) => {
        await scry(game, card, 1);
        await card.player.cardManager.draw(1);

        const interceptor = () => false;
        await card.player.hero.modifiers.add(
          new Modifier<HeroCard>('mana-visions-cannot-play-spells', game, card, {
            mixins: [
              new UntilEndOfTurnModifierMixin(game),
              new AuraModifierMixin(game, {
                canSelfApply: false,
                isElligible(candidate) {
                  return (
                    candidate.kind === CARD_KINDS.SPELL &&
                    candidate.player.equals(card.player) &&
                    candidate.location === 'hand'
                  );
                },
                async onGainAura(candidate) {
                  await candidate.addInterceptor('canPlay', interceptor);
                },
                async onLoseAura(candidate) {
                  await candidate.removeInterceptor('canPlay', interceptor);
                }
              })
            ]
          })
        );
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
