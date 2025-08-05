import { MainDeckCardInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.entity';

export const recollection: SpellBlueprint = {
  id: 'recollection',
  name: 'Recollection',
  cardIconId: 'spell-recollection',
  description:
    'Add a copy of all cards you played on your last turn to your hand.\n@[level] 5-@ : they cost 1 more.',
  collectable: true,
  unique: false,
  manaCost: 3,
  affinity: AFFINITIES.CHRONO,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 5));
  },
  async onPlay(game, card) {
    const playedCards = card.player.cardTracker.getCardsPlayedOnTurn(
      game.gamePhaseSystem.elapsedTurns - 1
    );

    const levelMod = card.modifiers.get(LevelBonusModifier);

    for (const playedCard of playedCards) {
      const copy = await card.player.generateCard(playedCard.blueprintId);
      await copy.addToHand();
      if (levelMod?.isActive) return;

      await copy.modifiers.add(
        new Modifier('recollection-debuff', game, card, {
          mixins: [
            new MainDeckCardInterceptorModifierMixin(game, {
              key: 'manaCost',
              interceptor: value => value! + 1
            })
          ]
        })
      );
    }
  }
};
