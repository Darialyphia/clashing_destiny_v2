import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { HeroCard } from '../../../entities/hero.entity';

export const sage: HeroBlueprint = {
  id: 'sage',
  name: 'Sage',
  cardIconId: 'hero-sage',
  description:
    '@[level] 4+@ : The first time you play a spell during your turn, draw 1 card.',
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  affinities: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 20,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<HeroCard>;

    await card.modifiers.add(
      new Modifier<HeroCard>('sage-spell-discount', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => {
            if (!levelMod.isActive) return false;
            if (!card.player.isCurrentPlayer) return false;
            return card.player.cardTracker.cardsPlayedThisTurn.every(
              card => card.kind !== CARD_KINDS.SPELL
            );
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
            handler: async event => {
              if (!event.data.card.player.equals(card.player)) return;
              if (event.data.card.kind !== CARD_KINDS.SPELL) return;

              await card.player.cardManager.draw(1);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
