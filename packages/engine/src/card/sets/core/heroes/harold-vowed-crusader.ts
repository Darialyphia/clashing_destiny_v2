import dedent from 'dedent';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { HeroBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED,
  CARD_LOCATIONS
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { ChannelModifier } from '../../../../modifier/modifiers/channel.modifier';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { LocationToggleModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const haroldVowedCrusader: HeroBlueprint = {
  id: 'harold-vowed-crusader',
  kind: CARD_KINDS.HERO,
  collectable: true,
  name: 'Harold Vowed Crusader',
  description: dedent /*html*/ `
    Your minions have <br/>"<rt-location locations="battlefield" always-active="true"></rt-location> <rt-keyword>Channel</rt-keyword> : Gain +1 Health."
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('heroes/harold-vowed-crusader'),
  speed: CARD_SPEED.SLOW,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.LIGHT, AFFINITIES.EARTH],
  tags: [],
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<HeroCard>('harold-vowed-crusader', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return candidate.isAlly(card) && isMinion(candidate);
            },
            getModifiers(candidate) {
              return [
                new ChannelModifier(game, card, {
                  handler: async () => {
                    await candidate.modifiers.add(
                      new SimpleHealthBuffModifier(
                        'harold-vowed-crusader-aura',
                        game,
                        card,
                        { amount: 1 }
                      )
                    );
                  },
                  mixins: [
                    new LocationToggleModifierMixin(game, [
                      CARD_LOCATIONS.LEFT_BATTLEFIELD,
                      CARD_LOCATIONS.RIGHT_BATTLEFIELD
                    ])
                  ]
                })
              ];
            }
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1
  }
};
