import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { CardAuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES, TAGS } from '../../../../card.enums';
import type { HeroCard } from '../../../../entities/hero-card.entity';

export const fireMastery: DestinyBlueprint = {
  id: 'fire_mastery',
  name: 'Fire Mastery',
  description:
    'When your <rt-card>Wheel of the elements</rt-card> cycles, add a <rt-card>Fire Shard</rt-card>, <rt-card>Water Shard</rt-card>, <rt-card>Air Shard</rt-card>, and <rt-card>Earth Shard</rt-card> to your hand, depending on the new element.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.RARE,
  jobs: [JOBS.ELEMENTALIST.id],
  expCost: 1,
  tags: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('fire-mastery-aura', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return candidate.kind === CARD_KINDS.SPELL && candidate.hasTag(TAGS.FIRE);
            },
            getModifiers() {
              return [
                new SimpleManacostModifier('fire-mastery-discount', game, card, {
                  amount: -1
                })
              ];
            }
          })
        ]
      })
    );
  }
};
