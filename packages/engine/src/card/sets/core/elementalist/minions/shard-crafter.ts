import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES,
  TAGS
} from '../../../../card.enums';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { Unit } from '../../../../../unit/unit.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { getWheelOfElementModifier } from '../../../../../modifier/modifiers/wheel-of-elements.modifier';
import type { AnyCard } from '../../../../entities/card.entity';
import { fireShard } from '../../mage/spells/fire-shard';
import { earthShard } from '../../mage/spells/earth-shard';
import { airShard } from '../../mage/spells/air-shard';
import { waterShard } from '../../mage/spells/water-shard';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';

export const shardCrafter: MinionBlueprint = {
  id: 'shard_crafter',
  name: 'Shard Crafter',
  description: dedent`
   <rt-trigger>Start of Turn</rt-trigger>: Add a <rt-card>Fire Shard</rt-card>, <rt-card>Water Shard</rt-card>, <rt-card>Air Shard</rt-card>, or <rt-card>Earth Shard</rt-card> to your hand depending on your <rt-card>Wheel of the Element</rt-card> current element.
   <rt-lvl-bonus lvl="6">Add all of them instead.</rt-lvl-bonus>
   `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.MELEE,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.ELEMENTALIST.id],
  manaCost: 2,
  tags: [TAGS.ELEMENTAL],
  atk: 1,
  retaliation: 1,
  maxHp: 5,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    const wheel = getWheelOfElementModifier(game, card.player)!;
    await card.modifiers.add(new LevelBonusModifier(game, card, 6));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier<Unit>('arcane-conduit-on-spell', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.TURN_START,
              async handler() {
                if (lvlMod.isActive) {
                  const fire = await card.player.generateCard(fireShard.id, card.isFoil);
                  const water = await card.player.generateCard(
                    waterShard.id,
                    card.isFoil
                  );
                  const air = await card.player.generateCard(airShard.id, card.isFoil);
                  const earth = await card.player.generateCard(
                    earthShard.id,
                    card.isFoil
                  );
                  await fire.addToHand();
                  await water.addToHand();
                  await air.addToHand();
                  await earth.addToHand();
                  return;
                }
                const element = wheel.currentElement;
                let shard: AnyCard;
                if (element === 'fire') {
                  shard = await card.player.generateCard(fireShard.id, card.isFoil);
                } else if (element === 'water') {
                  shard = await card.player.generateCard(waterShard.id, card.isFoil);
                } else if (element === 'air') {
                  shard = await card.player.generateCard(airShard.id, card.isFoil);
                } else {
                  shard = await card.player.generateCard(earthShard.id, card.isFoil);
                }
                await shard.addToHand();
              }
            })
          ]
        })
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
