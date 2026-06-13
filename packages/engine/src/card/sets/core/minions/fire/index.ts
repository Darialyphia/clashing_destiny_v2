import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import {
  LocationToggleModifierMixin,
  RuneCostToggleModifierMixin
} from '../../../../../modifier/mixins/togglable.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED,
  CARD_LOCATIONS
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';
import { AttackerModifier } from '../../../../../modifier/modifiers/attacker.modifier';
import { BlastModifier } from '../../../../../modifier/modifiers/blast.modifier';

export const pyromancer: MinionBlueprint = {
  id: 'pyromancer',
  name: 'Pyromancer',
  description: dedent /*html*/ `
  <rt-location locations="battlefield">
    <rt-trigger>Start of Turn</rt-trigger> Add a <rt-card>Firebolt</rt-card> to your hand.
  </rt-location>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  power: 3,
  damage: 1,
  bounty: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<MinionCard>('pyromancer', game, card, {
        mixins: [
          new LocationToggleModifierMixin(game, [
            CARD_LOCATIONS.LEFT_BATTLEFIELD,
            CARD_LOCATIONS.RIGHT_BATTLEFIELD
          ]),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_START,
            async handler() {
              const fireBoltCard = await card.player.generateCard(
                'fireBolt',
                card.isFoil
              );
              await fireBoltCard.addToHand();
            }
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};

export const recklessRecruit: MinionBlueprint = {
  id: 'recklessRecruit',
  name: 'Reckless Recruit',
  description: dedent /*html*/ `
  <rt-keyword>Rush 1</rt-keyword> <rt-keyword><rt-runes runes="might,might,might"></rt-runes> Attacker 2</rt-keyword>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  power: 1,
  damage: 1,
  bounty: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card, { cost: 1 }));
    await card.modifiers.add(
      new AttackerModifier(game, card, {
        amount: 2,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 3
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};

export const willowisp: MinionBlueprint = {
  id: 'willowisp',
  name: 'Will-o-Wisp',
  description: dedent /*html*/ `<rt-keyword>Blast 1</rt-keyword>`,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinities: [AFFINITIES.FIRE],
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  power: 1,
  damage: 1,
  bounty: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new BlastModifier(game, card, { amount: 1 }));
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
