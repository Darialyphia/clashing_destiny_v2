import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import {
  WhileOnBaseModifier,
  WhileOnBattlefieldModifier
} from '../../../../../modifier/modifiers/while-on-board.modifier';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import type { MinionCard } from '../../../../entities/minion.entity';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const enigmaticWizard: MinionBlueprint = {
  id: 'enigmaticWizard',
  name: 'Enigmatic Wizard',
  description: dedent /*html*/ `
    <rt-location locations="battlefield"><rt-trigger>Start of Turn</rt-trigger> Put an Arcane Spark in your hand. <br /><rt-runes runes="focus"></rt-runes>This can also happen in base.
    </rt-location>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const mixins = () => [
      new GameEventModifierMixin(game, {
        eventName: GAME_EVENTS.TURN_START,
        handler: async () => {
          const generatedCard = await card.player.generateCard(
            'arcaneSpark',
            card.isFoil
          );
          await generatedCard.addToHand();
        }
      })
    ];
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('enigmaticWizard', game, card, {
        mixins: mixins()
      })
    );
    await card.modifiers.add(
      new WhileOnBaseModifier<MinionCard>('enigmaticWizard', game, card, {
        mixins: [...mixins(), new RuneCostToggleModifierMixin(game, card, { focus: 1 })]
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
