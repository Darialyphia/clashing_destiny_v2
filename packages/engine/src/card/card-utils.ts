import { isDefined, type Nullable, type Override } from '@game/shared';
import type { GenericAOEShape } from '../aoe/aoe-shape';
import { PointAOEShape } from '../aoe/point.aoe-shape';
import type { BoardCell } from '../board/entities/board-cell.entity';
import type { Game } from '../game/game';
import { TARGETING_TYPE } from '../targeting/targeting-strategy';
import type { Unit } from '../unit/unit.entity';
import { CARD_KINDS } from './card.enums';
import type { ArtifactCard } from './entities/artifact-card.entity';
import type { AnyCard } from './entities/card.entity';
import type { DestinyCard } from './entities/destiny-card.entity';
import type { HeroCard } from './entities/hero-card.entity';
import type { MinionCard } from './entities/minion-card.entity';
import type { SpellCard } from './entities/spell-card.entity';
import type { AbilityBlueprint, CardBlueprint } from './card-blueprint';
import type { VFXSequence } from '../game/systems/vfx.system';

export const isMinion = (card: AnyCard): card is MinionCard => {
  return card.kind === CARD_KINDS.MINION;
};

export const isSpell = (card: AnyCard): card is SpellCard => {
  return card.kind === CARD_KINDS.SPELL;
};

export const isArtifact = (card: AnyCard): card is ArtifactCard => {
  return card.kind === CARD_KINDS.ARTIFACT;
};

export const isHero = (card: AnyCard): card is HeroCard => {
  return card.kind === CARD_KINDS.HERO;
};

export const isDestiny = (card: AnyCard): card is DestinyCard => {
  return card.kind === CARD_KINDS.DESTINY;
};

export const singleEnemyTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (unit: Unit) => boolean = () => true) {
    return (
      card.player.enemyUnits.filter(unit => unit.canBeTargetedBy(card) && predicate(unit))
        .length > 0
    );
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    {
      predicate = () => true,
      getAoe = () => new PointAOEShape(TARGETING_TYPE.UNIT, {}),
      getLabel = () => `${card.blueprint.name} : Select an enemy unit`,
      timeoutFallback,
      required = true
    }: {
      predicate?: (unit: Unit) => boolean;
      getAoe?: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
      getLabel?: () => string;
      required?: boolean;
      timeoutFallback: BoardCell[];
    }
  ) {
    return await game.interaction.selectSpacesOnBoard({
      player: card.player,
      getLabel: getLabel,
      source: card,
      getAoe,
      timeoutFallback,
      isElligible(candidate, selectedCards) {
        if (!candidate.unit) return false;

        return (
          candidate.unit.isEnemy(card.player) &&
          candidate.unit.canBeTargetedBy(card) &&
          !selectedCards.some(selected => selected.equals(candidate)) &&
          predicate(candidate.unit)
        );
      },
      canCommit(selectedCards) {
        return required ? selectedCards.length === 1 : true;
      },
      isDone(selectedCards) {
        return selectedCards.length === 1;
      }
    });
  }
};

export const singleMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: Unit) => boolean = () => true) {
    return (
      [...card.player.units, ...card.player.enemyUnits].filter(
        unit => unit.canBeTargetedBy(card) && predicate(unit)
      ).length > 0
    );
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    {
      required = true,
      predicate = () => true,
      getAoe = () => new PointAOEShape(TARGETING_TYPE.UNIT, {}),
      getLabel = () => `${card.blueprint.name} : Select a minion`,
      timeoutFallback
    }: {
      required?: boolean;
      predicate?: (unit: Unit) => boolean;
      getAoe?: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
      getLabel?: () => string;
      timeoutFallback: BoardCell[];
    }
  ) {
    return await game.interaction.selectSpacesOnBoard({
      player: card.player,
      source: card,
      getLabel: getLabel,
      getAoe,
      timeoutFallback,
      isElligible(candidate, selectedCells) {
        if (!candidate.unit || !isMinion(candidate.unit.card)) {
          return false;
        }

        return (
          candidate.unit.canBeTargetedBy(card) &&
          !selectedCells.some(selected => selected.equals(candidate)) &&
          predicate(candidate.unit)
        );
      },
      canCommit(selectedCards) {
        return required ? selectedCards.length === 1 : true;
      },
      isDone(selectedCards) {
        return selectedCards.length === 1;
      }
    });
  }
};

export const multipleUnitsTargetRules = {
  canPlay:
    (min: number) =>
    (game: Game, card: AnyCard, predicate: (unit: Unit) => boolean = () => true) => {
      return (
        game.unitSystem.units.filter(
          unit => unit.canBeTargetedBy(card) && predicate(unit)
        ).length > min
      );
    },
  getPreResponseTargets:
    ({ min, max, allowRepeat }: { min: number; max: number; allowRepeat: boolean }) =>
    async (
      game: Game,
      card: AnyCard,
      {
        predicate = () => true,
        getAoe,
        getLabel = selected =>
          `${card.blueprint.name} : Select targets (${selected} / ${max})`,
        timeoutFallback
      }: {
        predicate?: (candidate: Unit, selected: Unit[]) => boolean;
        getAoe: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
        getLabel?: (selectedSpaces: BoardCell[]) => string;
        timeoutFallback: BoardCell[];
      }
    ) => {
      return await game.interaction.selectSpacesOnBoard({
        player: card.player,
        source: card,
        timeoutFallback,
        getLabel,
        getAoe,
        isElligible(candidate, selectedCards) {
          if (!candidate.unit) {
            return false;
          }

          return (
            candidate.unit.canBeTargetedBy(card) &&
            (allowRepeat
              ? true
              : !selectedCards.some(selected => selected.equals(candidate))) &&
            predicate(
              candidate.unit,
              selectedCards.map(c => c.unit!)
            )
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

export const anywhereTargetRules = {
  canPlay:
    ({ min }: { min: number; max: number }) =>
    (game: Game, card: AnyCard, predicate: (cell: BoardCell) => boolean = () => true) => {
      const allCells = game.boardSystem.cells;
      const elligibleCells = allCells.filter(cell => predicate(cell) && !cell.unit);
      return elligibleCells.length >= min;
    },
  getPreResponseTargets:
    ({ min, max, allowRepeat }: { min: number; max: number; allowRepeat: boolean }) =>
    async (
      game: Game,
      card: AnyCard,
      {
        predicate = () => true,
        getAoe = () => new PointAOEShape(TARGETING_TYPE.UNIT, {}),
        getLabel = () => `${card.blueprint.name} : Select a space`,
        timeoutFallback = []
      }: {
        predicate?: (cell: BoardCell) => boolean;
        getAoe?: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
        getLabel?: () => string;
        timeoutFallback?: BoardCell[];
      } = {}
    ) => {
      return await game.interaction.selectSpacesOnBoard({
        player: card.player,
        source: card,
        timeoutFallback,
        getLabel,
        getAoe,
        isElligible(candidate, selectedCells) {
          return (
            (allowRepeat
              ? true
              : !selectedCells.some(selected => selected.equals(candidate))) &&
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

export const emptySpacesTargetRules = {
  canPlay:
    ({ min }: { min: number }) =>
    (game: Game, predicate: (cell: BoardCell) => boolean = () => true) => {
      const allCells = game.boardSystem.cells;
      const elligibleCells = allCells.filter(cell => predicate(cell) && !cell.unit);
      return elligibleCells.length >= min;
    },
  getPreResponseTargets:
    ({ min, max }: { min: number; max: number }) =>
    async (
      game: Game,
      card: AnyCard,
      {
        predicate = () => true,
        getAoe = () => new PointAOEShape(TARGETING_TYPE.UNIT, {}),
        getLabel = () => `${card.blueprint.name} : Select a space`,
        timeoutFallback
      }: {
        predicate?: (cell: BoardCell) => boolean;
        getAoe?: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
        getLabel?: (selectedSpaces: BoardCell[]) => string;
        timeoutFallback: BoardCell[];
      }
    ) => {
      return await game.interaction.selectSpacesOnBoard({
        player: card.player,
        source: card,
        timeoutFallback,
        getLabel,
        getAoe,
        isElligible(candidate, selectedCells) {
          return (
            !candidate.unit &&
            !selectedCells.some(selected => selected.equals(candidate)) &&
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

export const singleUnitTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: Unit) => boolean = () => true) {
    return (
      [...card.player.units, ...card.player.enemyUnits].filter(
        unit => unit.canBeTargetedBy(card) && predicate(unit)
      ).length > 0
    );
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    {
      required = true,
      predicate = () => true,
      getAoe = () => new PointAOEShape(TARGETING_TYPE.ALLY_UNIT, {}),
      getLabel = () => `${card.blueprint.name} : Select a unit`,
      timeoutFallback
    }: {
      required?: boolean;
      predicate?: (unit: Unit) => boolean;
      getAoe?: (selectedSpaces: BoardCell[]) => GenericAOEShape | null;
      getLabel?: () => string;
      timeoutFallback: BoardCell[];
    }
  ) {
    return await game.interaction.selectSpacesOnBoard({
      player: card.player,
      source: card,
      timeoutFallback,
      getLabel,
      getAoe,
      isElligible(candidate, selectedCells) {
        if (!candidate.unit) {
          return false;
        }

        return (
          candidate.unit.canBeTargetedBy(card) &&
          !selectedCells.some(selected => selected.equals(candidate)) &&
          predicate(candidate.unit)
        );
      },
      canCommit(selectedCards) {
        return required ? selectedCards.length === 1 : true;
      },
      isDone(selectedCards) {
        return selectedCards.length === 1;
      }
    });
  }
};

export const unitAbility = (
  ability: Override<
    AbilityBlueprint<MinionCard>,
    { canUse?: Nullable<AbilityBlueprint<MinionCard>['canUse']> }
  >
): AbilityBlueprint<MinionCard> => ({
  ...ability,
  canUse(game, card) {
    if (!isDefined(card.unit)) return false;
    if (card.unit.isExhausted) return false;
    return ability?.canUse?.(game, card) ?? true;
  }
});

export const artifactAbility = (
  ability: Override<
    AbilityBlueprint<ArtifactCard>,
    { canUse?: Nullable<AbilityBlueprint<ArtifactCard>['canUse']> }
  >
): AbilityBlueprint<ArtifactCard> => ({
  ...ability,
  canUse(game, card) {
    if (!isDefined(card.artifact)) return false;
    if (card.artifact.isExhausted) return false;
    return ability?.canUse?.(game, card) ?? true;
  }
});

export const heroAbility = (
  ability: Override<
    AbilityBlueprint<HeroCard>,
    { canUse?: Nullable<AbilityBlueprint<HeroCard>['canUse']> }
  >
): AbilityBlueprint<HeroCard> => ({
  ...ability,
  canUse(game, card) {
    if (card.isExhausted) return false;
    return ability?.canUse?.(game, card) ?? true;
  }
});

export const defaultCardArt = (name: string): CardBlueprint['art'] => ({
  default: {
    foil: {
      sheen: true,
      brightShine: true,
      lightGradient: true,
      scanlines: true
    },
    isFullArt: false,
    bg: `${name}-bg`,
    main: `${name}-main`
  }
});

export const defaultMinionPlaySequence = (game: Game, card: MinionCard): VFXSequence => {
  return {
    tracks: [
      {
        steps: [
          {
            type: 'dropUnit',
            params: { unitId: card.unit.id, from: { scale: 3 }, duration: 300 }
          }
        ]
      }
    ]
  };
};
