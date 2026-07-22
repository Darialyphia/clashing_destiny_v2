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
  WhileOnBattlefieldModifier,
  WhileOnBoardModifier
} from '../../../../../modifier/modifiers/while-on-board.modifier';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import type { MinionCard } from '../../../../entities/minion.entity';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const enigmaticWizard: MinionBlueprint = {
  id: 'enigmaticWizard',
  name: 'Enigmatic Wizard',
  description: dedent /*html*/ `
    <rt-location locations="battlefield"><rt-trigger>Start of Turn</rt-trigger> Put an Arcane Spark in your hand. <br /><rt-runes runes="focus,resonance"></rt-runes>This can also happen in base.
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
  runeCost: [],
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('enigmaticWizard', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_START,
            handler: async () => {
              const shouldTrigger = card.player.runeManager.has({
                focus: 1,
                resonance: 1
              })
                ? true
                : card.isOnBattlefield;

              if (!shouldTrigger) return;

              const generatedCard = await card.player.generateCard(
                'arcaneSpark',
                card.isFoil
              );
              await generatedCard.addToHand();
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
