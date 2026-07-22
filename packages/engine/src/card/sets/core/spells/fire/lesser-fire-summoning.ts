import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  JOBS,
  RARITIES
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { defaultCardArt, emptyBoardSpaceTargetRules } from '../../../../card-utils';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const lesserFireSummoning: SpellBlueprint = {
  id: 'lesserFireSummoning',
  name: 'Lesser Fire Summoning',
  description: dedent /*html*/ `
  Summon a <rt-card>Will-o-Wisp</rt-card> on a battlefield exhausted. 
  <rt-runes runes="wisdom,wisdom,wisdom"></rt-runes> <rt-keyword>Echo</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/lesser-fire-summoning'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    emptyBoardSpaceTargetRules.canPlay(
      game,
      space =>
        space.player.equals(card.player) &&
        (space.position.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
          space.position.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD)
    ),
  getTargets: (game, card) =>
    emptyBoardSpaceTargetRules.getTargets({
      game,
      card,
      predicate: space =>
        space.player.equals(card.player) &&
        (space.position.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
          space.position.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD),
      label: 'Select a space to summon the Willowisp'
    }),
  async onInit(game, card) {
    await card.modifiers.add(
      new EchoModifier(game, card, {
        mixins: [new RuneCostToggleModifierMixin(game, card, { wisdom: 3 })]
      })
    );
  },
  async onPlay(game, card, targets) {
    const minion = await card.player.generateCard<MinionCard>('willowisp', card.isFoil);
    await minion.exhaust();
    await minion.playImmediatelyAt(targets.spaces[0]);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
