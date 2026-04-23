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
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { MinionOnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { fireBolt } from '../spells/fire-bolt';
import { JobBonusModifier } from '../../../../../modifier/modifiers/job-bonus.modifier';
import type { MinionCard } from '../../../../entities/minion-card.entity';
import { fireShard } from '../spells/fire-shard';
import { getWheelOfElementModifier } from '../../../../../modifier/modifiers/wheel-of-elements.modifier';
import { ShooterModifier } from '../../../../../modifier/modifiers/shooter.modifier';

export const pyromancer: MinionBlueprint = {
  id: 'pyromancer',
  name: 'Pyromancer',
  description: dedent`
  <rt-keyword>Shooter</rt-keyword>.
  <rt-trigger>On Enter</rt-trigger> Add a <rt-card>Fire Bolt</rt-card> to your hand.
  <rt-job-bonus job="Elementalist">Whenever you play a <rt-card>Fire Bolt</rt-card> and your <rt-card>Wheel of the Elements</rt-card> is Fire, add a <rt-card>Fire Shard</rt-card> to your hand.</rt-job-bonus>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.RANGED,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE.id],
  manaCost: 3,
  tags: [],
  atk: 2,
  retaliation: 1,
  maxHp: 4,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new ShooterModifier(game, card, {}));
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, {
        async handler() {
          const bolt = await card.player.generateCard(fireBolt.id, card.isFoil);
          await bolt.addToHand();
        }
      })
    );

    const elementalistMod = (await card.modifiers.add(
      new JobBonusModifier(game, card, JOBS.ELEMENTALIST.id)
    )) as JobBonusModifier<MinionCard>;

    await card.modifiers.add(
      new Modifier('pyromancer-elementalist-bonus', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => {
            const wheelMod = getWheelOfElementModifier(game, card.player);
            return elementalistMod?.isActive && wheelMod?.currentElement === 'fire';
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
            filter(event) {
              if (!event) return false;
              return (
                event.data.card.isAlly(card) &&
                event.data.card.blueprintId === fireBolt.id
              );
            },
            unitForVisualFX() {
              return card.unit;
            },
            async handler() {
              const shard = await card.player.generateCard(fireShard.id, card.isFoil);
              await shard.addToHand();
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
