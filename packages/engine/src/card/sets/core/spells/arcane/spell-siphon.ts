import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, effectTargetRules, isSpell } from '../../../../card-utils';
import {
  JOBS,
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { EFFECT_TYPE } from '../../../../../game/game.enums';
import { RUNES } from '../../../../../player/player.enums';

export const spellSiphon: SpellBlueprint = {
  id: 'spellSiphon',
  name: 'Spell Siphon',
  description: dedent /*html*/ `
    Consume <rt-runes runes="resonance"></rt-runes>. Negate the activation of a spell that costs 3 or less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder-spell'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    effectTargetRules.canPlay(
      game,
      card,
      effect =>
        effect.type === EFFECT_TYPE.CARD &&
        isSpell(effect.source) &&
        effect.source.manaCost <= 3
    ) && card.player.runeManager.has({ resonance: 1 }),
  getTargets: (game, card) =>
    effectTargetRules.getTargets({
      game,
      card,
      predicate: effect =>
        effect.type === EFFECT_TYPE.CARD &&
        isSpell(effect.source) &&
        effect.source.manaCost <= 3
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const effect = targets.effect;
    if (!effect) return;
    if (!card.player.runeManager.has({ resonance: 1 })) return;
    await card.player.runeManager.remove([RUNES.RESONANCE]);
    game.effectChainSystem.currentChain?.negateEffect(effect.id);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
