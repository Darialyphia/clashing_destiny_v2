import { isDefined } from '@game/shared';
import type { Game } from '../game/game';
import { CARD_KINDS } from './card.enums';
import type { ArtifactCard } from './entities/artifact.entity';
import type { AttackCard } from './entities/attack.entity';
import type { AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { LocationCard } from './entities/location.entity';
import type { MinionCard } from './entities/minion.card';
import type { SpellCard } from './entities/spell.entity';
import type { TalentCard } from './entities/talent.entity';

export const isHero = (card: AnyCard): card is HeroCard => {
  return card.kind === CARD_KINDS.HERO;
};

export const isMinion = (card: AnyCard): card is MinionCard => {
  return card.kind === CARD_KINDS.MINION;
};

export const isSpell = (card: AnyCard): card is SpellCard => {
  return card.kind === CARD_KINDS.SPELL;
};

export const isArtifact = (card: AnyCard): card is ArtifactCard => {
  return card.kind === CARD_KINDS.ARTIFACT;
};

export const isTalent = (card: AnyCard): card is TalentCard => {
  return card.kind === CARD_KINDS.TALENT;
};

export const isLocation = (card: AnyCard): card is LocationCard => {
  return card.kind === CARD_KINDS.LOCATION;
};

export const isAttack = (card: AnyCard): card is AttackCard => {
  return card.kind === CARD_KINDS.ATTACK;
};

export const singleEnemyTargetRules = {
  canPlay(
    game: Game,
    card: AnyCard,
    predicate: (c: MinionCard | HeroCard) => boolean = () => true
  ) {
    return (
      card.player.allEnemies.filter(c => c.canBeTargeted(card) && predicate(c)).length > 0
    );
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    predicate: (c: MinionCard | HeroCard) => boolean = () => true
  ) {
    return await game.interaction.selectCardsOnBoard<MinionCard | HeroCard>({
      player: card.player,
      isElligible(candidate, selectedCards) {
        if (!isMinion(candidate) && !isHero(candidate)) {
          return false;
        }
        return (
          card.player.allEnemies.some(enemy => enemy.equals(candidate)) &&
          candidate.canBeTargeted(card) &&
          !selectedCards.some(selected => selected.equals(candidate)) &&
          predicate(candidate)
        );
      },
      canCommit(selectedCards) {
        return selectedCards.length === 1;
      },
      isDone(selectedCards) {
        return selectedCards.length === 1;
      }
    });
  }
};

export const singleEnemyMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: MinionCard) => boolean = () => true) {
    return (
      card.player.enemyMinions.filter(c => c.canBeTargeted(card) && predicate(c)).length >
      0
    );
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    predicate: (c: MinionCard) => boolean = () => true
  ) {
    return await game.interaction.selectCardsOnBoard<MinionCard>({
      player: card.player,
      isElligible(candidate, selectedCards) {
        if (!isMinion(candidate)) {
          return false;
        }

        return (
          card.player.allEnemies.some(enemy => enemy.equals(candidate)) &&
          candidate.canBeTargeted(card) &&
          !selectedCards.some(selected => selected.equals(candidate)) &&
          predicate(candidate)
        );
      },
      canCommit(selectedCards) {
        return selectedCards.length === 1;
      },
      isDone(selectedCards) {
        return selectedCards.length === 1;
      }
    });
  }
};

export const singleEmptyAllySlot = {
  canPlay(game: Game, card: AnyCard) {
    return card.player.boardSide.hasUnoccupiedSlot;
  },
  async getPreResponseTargets(game: Game, card: AnyCard) {
    return await game.interaction.selectMinionSlot({
      player: card.player,
      isElligible(slot) {
        return (
          slot.player.equals(card.player) &&
          !slot.player.boardSide.getSlot(slot.zone, slot.slot)?.isOccupied
        );
      },
      canCommit(selectedSlots) {
        return selectedSlots.length === 1;
      },
      isDone(selectedSlots) {
        return selectedSlots.length === 1;
      }
    });
  }
};

export const multipleEnemyTargetRules = {
  canPlay:
    (min: number) =>
    (
      game: Game,
      card: AnyCard,
      predicate: (c: MinionCard | HeroCard) => boolean = () => true
    ) => {
      return (
        card.player.allEnemies.filter(c => c.canBeTargeted(card) && predicate(c)).length >
        min
      );
    },
  getPreResponseTargets:
    ({ min, max, allowRepeat }: { min: number; max: number; allowRepeat: boolean }) =>
    async (
      game: Game,
      card: AnyCard,
      predicate: (c: MinionCard | HeroCard) => boolean = () => true
    ) => {
      return await game.interaction.selectCardsOnBoard<MinionCard | HeroCard>({
        player: card.player,
        isElligible(candidate, selectedCards) {
          if (card.isAlly(candidate) || isMinion(candidate) || !isHero(candidate)) {
            return false;
          }
          return (
            card.player.allEnemies.some(enemy => enemy.equals(candidate)) &&
            candidate.canBeTargeted(card) &&
            (allowRepeat
              ? true
              : !selectedCards.some(selected => selected.equals(candidate))) &&
            predicate(candidate)
          );
        },
        canCommit(selectedCards) {
          return selectedCards.length >= min;
        },
        isDone(selectedCards) {
          return selectedCards.length === max;
        }
      });
    }
};

export const attackRules = {
  async getPreResponseTargets(game: Game, card: AnyCard) {
    return await game.interaction.selectCardsOnBoard<MinionCard | HeroCard>({
      player: card.player,
      isElligible(card) {
        if (isMinion(card)) {
          return isDefined(card.location);
        }
        if (isHero(card)) return true;
        return false;
      },
      canCommit(selectedSlots) {
        return selectedSlots.length === 1;
      },
      isDone(selectedSlots) {
        return selectedSlots.length === 1;
      }
    });
  }
};
