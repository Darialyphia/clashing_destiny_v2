import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { battlefieldTargetingRules, defaultCardArt } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { DestinyCard } from '../../../entities/destiny.entity';

export const firestormMantra: SpellBlueprint<DestinyCard> = {
  id: 'firestormMantra',
  name: 'Firestorm Mantra',
  description: dedent /*html*/ `
  Steal influence on a battlefield equal to the amount of spells you played this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/firestorm-mantra'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.LEGENDARY,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE, AFFINITIES.FIRE],
  manaCost: 4,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) =>
    battlefieldTargetingRules.getTargets({
      game,
      card,
      timeoutFallback: [],
      aiHints: { shouldPick: () => 1 }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets.cards[0];
    if (!target) return;
    const amountToSteal = card.player.cardTracker.getCardsPlayedThisTurnOfKind(
      CARD_KINDS.SPELL
    ).length;
    await target.battlefield?.gainScore(amountToSteal);
    await target.battlefield?.opponentBattlefield.loseScore(amountToSteal);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
