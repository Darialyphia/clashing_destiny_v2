import dedent from 'dedent';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isHero, isMinion, noTargets } from '../../../../card-utils';
import { AFFINITIES, CARD_KINDS, RARITIES } from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { CardAuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { HeroCard } from '../../../../entities/hero.entity';
import { OnStrikeModifier } from '../../../../../modifier/modifiers/on-strike.modifier';
import { BurnModifier } from '../../../../../modifier/modifiers/burn.modifier';

export const burningHands: DestinyBlueprint = {
  id: 'burning-hands',
  name: 'Burning Hands',
  description: dedent /*html */ `
  <rt-mana>2</rt-mana> : This turn, your minions have 
  <rt-trigger>On Attack</rt-trigger> <rt-keyword>Burn 1</rt-keyword>.
  `,
  collectable: true,
  setId: 'CORE',
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinities: [AFFINITIES.FIRE],
  expCost: 1,
  tags: [],
  getTargets: noTargets,
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.abilityManager.addAbility({
      id: 'burning-hands-attack-buff',
      canUse: () => true,
      manaCost: 2,
      description:
        'This turn, your minions have <rt-trigger>On Attack</rt-trigger> <rt-keyword>Burn 1</rt-keyword>.',
      label: 'Burning Hands',
      getTargets: noTargets,
      async onResolve(game, card) {
        await card.player.hero.modifiers.add(
          new Modifier<HeroCard>('burning-hands', game, card, {
            mixins: [
              new UntilEndOfTurnModifierMixin(game),
              new CardAuraModifierMixin(game, card, {
                isElligible(candidate) {
                  return isMinion(candidate) && candidate.isAlly(card);
                },
                getModifiers() {
                  return [
                    new OnStrikeModifier(game, card, {
                      handler: async event => {
                        const target = event.data.target;
                        if (isHero(target)) return;
                        await target.modifiers.add(
                          new BurnModifier(game, card, { stacks: 1 })
                        );
                      }
                    })
                  ];
                }
              })
            ]
          })
        );
      },
      isHiddenOnCard: true,
      aiHints: {
        shouldUse: () => 1
      }
    });
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
