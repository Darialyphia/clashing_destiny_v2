import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { battlefieldTargetingRules, defaultCardArt } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, CARD_SPEED, RARITIES } from '../../../card.enums';
import type { LocationCard } from '../../../entities/location.entity';
import { FACTION_IDS } from '../../../factions/factions';

export const firestormMantra: SpellBlueprint<LocationCard> = {
  id: 'firestormMantra',
  name: 'Firestorm Mantra',
  description: dedent /*html*/ `
  Steal influence on a battlefield equal to the amount of spells you played this turn + 1.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/firestorm-mantra'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.EPIC,
  manaCost: 2,
  manaSupply: 2,
  level: 3,
  exp: 1,
  factionId: FACTION_IDS.SONGHAI,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) =>
    battlefieldTargetingRules.getTargets({
      game,
      card,
      timeoutFallback: [],
      canCancel: true,
      aiHints: { shouldPick: () => 1 }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets.cards[0];
    if (!target) return;
    const amountToSteal =
      card.player.cardTracker.getCardsPlayedThisTurnOfKind(CARD_KINDS.SPELL).length + 1;
    if (target.isAlly(card)) {
      await target.battlefield?.gainScore(amountToSteal);
      await target.battlefield?.opponentBattlefield.loseScore(amountToSteal);
    } else {
      await target.battlefield?.opponentBattlefield.gainScore(amountToSteal);
      await target.battlefield?.loseScore(amountToSteal);
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
