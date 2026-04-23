import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { CardAuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import {
  CardInterceptorModifierMixin,
  HeroCardInterceptorModifierMixin
} from '../../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES } from '../../../../card.enums';
import type { ArtifactCard } from '../../../../entities/artifact-card.entity';
import type { HeroCard } from '../../../../entities/hero-card.entity';
import { wheelOfTheElements } from '../../elementalist/artifacts/wheel-of-the-elements';

export const elementalistPath: DestinyBlueprint = {
  id: 'elementalist_path',
  name: "Elementalist's Path",
  description:
    'Your hero gains the Elementalist Job. Equip the <rt-card>Wheel of the Elements</rt-card>.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE.id],
  expCost: 2,
  tags: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('elementalist-path', game, card, {
        mixins: [
          new CardInterceptorModifierMixin(game, {
            key: 'jobs',
            interceptor(value) {
              if (!value.includes(JOBS.ELEMENTALIST.id)) {
                return [...value, JOBS.ELEMENTALIST.id];
              }
              return value;
            }
          })
        ]
      })
    );

    const wheel = await card.player.generateCard<ArtifactCard>(
      wheelOfTheElements.id,
      card.isFoil
    );
    await wheel.play(() => {});
  }
};
