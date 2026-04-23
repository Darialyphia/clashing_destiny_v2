import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { ShooterModifier } from '../../../../../modifier/modifiers/shooter.modifier';
import { JobBonusModifier } from '../../../../../modifier/modifiers/job-bonus.modifier';
import type { MinionCard } from '../../../../entities/minion-card.entity';
import { predict } from '../../../../card-actions-utils';

export const seerOfTheDepths: MinionBlueprint = {
  id: 'seer-of-the-depths',
  name: 'Seer of the Depths',
  description: dedent`
  <rt-keyword>Shooter</rt-keyword>
  <br />
  <rt-job-bonus job="Elementalist">When your <rt-card>Wheel of the Elements</rt-card> cycles to Water, <rt-keyword>Predict</rt-keyword></rt-job-bonus><rt-lvl-bonus lvl="4">Draw a card.</rt-lvl-bonus>  
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.RANGED,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE.id],
  manaCost: 3,
  tags: [],
  atk: 2,
  retaliation: 0,
  maxHp: 5,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new ShooterModifier(game, card, {}));

    const elementalistMod = (await card.modifiers.add(
      new JobBonusModifier(game, card, JOBS.ELEMENTALIST.id)
    )) as JobBonusModifier<MinionCard>;
    const lvlMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 4)
    )) as LevelBonusModifier<MinionCard>;

    await card.modifiers.add(
      new Modifier('seer-of-the-depths-elementalist-bonus', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => elementalistMod.isActive),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.MODIFIER_WHEEL_OF_ELEMENTS_ROTATE,
            filter: event => {
              if (!event) return false;
              return event.data.player.equals(card.player) && event.data.to === 'water';
            },
            unitForVisualFX() {
              return card.unit;
            },
            async handler() {
              await predict(game, card);
              if (lvlMod.isActive) {
                await card.player.cardManager.drawFromDeck(1);
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
