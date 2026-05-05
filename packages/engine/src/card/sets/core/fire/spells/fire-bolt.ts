import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleEnemyTargetRules } from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  JOBS,
  RARITIES
} from '../../../../card.enums';
import { JobBonusModifier } from '../../../../../modifier/modifiers/job-bonus.modifier';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SpellDamage } from '../../../../../utils/damage';
import { BurnModifier } from '../../../../../modifier/modifiers/burn.modifier';

export const fireBolt: SpellBlueprint = {
  id: 'fireBolt',
  name: 'Fire Bolt',
  description: dedent /*html*/ `
  Deal 1 damage to an enemy.
  <rt-job-bonus job="${JOBS.MAGE.id}">If the target has <rt-keyword>Burn</rt-keyword>, draw a card.</rt-job-bonus>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinity: AFFINITIES.FIRE,
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  tags: [],
  abilities: [],
  canPlay: () => true,
  getTargets: (game, card) =>
    singleEnemyTargetRules.getTargets({
      game,
      card,
      origin: { type: 'card', card },
      timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit(game, card) {
    await card.modifiers.add(new JobBonusModifier(game, card, JOBS.MAGE.id));
  },
  async onPlay(game, card, targets) {
    const [target] = targets as MinionCard[];
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(1, card));

    const jobMod = card.modifiers.get(JobBonusModifier);
    if (jobMod?.isActive && target.modifiers.has(BurnModifier)) {
      await card.player.cardManager.draw(1);
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
