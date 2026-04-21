import dedent from 'dedent';
import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { CardAuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { ArtifactBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES, TAGS } from '../../../../card.enums';
import type { HeroCard } from '../../../../entities/hero-card.entity';

export const wheelOfTheElements: ArtifactBlueprint = {
  id: 'wheel_of_the_elements',
  name: 'Wheel of the Elements',
  description: dedent`Indestructible, Untargetable.
  Cycle through Fire, Earth, Water and Air (starts at Fire). Whenever you play a spell, cycle to the next element. 
  Before playing a spell of the current element, <rt-keyword>Empower (1)</rt-keyword>`,
  collectable: false,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.ARTIFACT,
  manaCost: 0,
  durability: 1,
  rarity: RARITIES.RARE,
  jobs: [JOBS.ELEMENTALIST.id],
  tags: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  abilities: [],
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
