import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { singleMinionTargetRules } from '../../../card-utils';
import { SimpleDestinyCostModifier } from '../../../../modifier/modifiers/simple-destinycost.modifier';

export const oniBoundEmberblade: MinionBlueprint = {
  id: 'oni-bound-emberblade',
  name: 'Oni-bound Emberblade',
  cardIconId: 'minions/oni-bound-emberblade',
  description: dedent`
  @On Enter@ : Destroy a minion.
  @[level] 3 bonus@: This costs @[destiny] 1@ less.
  `,
  collectable: true,
  unique: false,
  destinyCost: 2,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: null,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const leveMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<MinionCard>;

    await card.modifiers.add(
      new SimpleDestinyCostModifier('oni-bound-emberblade-discount', game, card, {
        amount: -1,
        mixins: [new TogglableModifierMixin(game, () => leveMod.isActive)]
      })
    );
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const [minionToDestroy] = await singleMinionTargetRules.getPreResponseTargets(
            game,
            card,
            {
              type: 'card',
              card
            }
          );

          await minionToDestroy?.destroy();
        }
      })
    );
  },
  async onPlay() {}
};
