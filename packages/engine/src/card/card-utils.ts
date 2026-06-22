import type { Game } from '../game/game';
import type { InteractionResult } from '../game/systems/game-interaction.system';
import type { Player } from '../player/player.entity';
import type { CardBlueprint, Targets } from './card-blueprint';
import { CARD_KINDS, CARD_LOCATIONS } from './card.enums';
import type { AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SpellCard } from './entities/spell.entity';
import type { ArtifactCard } from './entities/artifact.entity';
import type { BoardSpace } from '../board/board-space.entity';
import { PointAOEShape } from '../aoe/point.aoe-shape';
import { AOE_TARGETING_TYPE } from '../aoe/aoe-shape';
import { isFunction } from '@game/shared';
import type { DestinyCard } from './entities/destiny.entity';
import type { Effect } from '../game/effect-chain';

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

export const isMinionOrHero = (card: AnyCard): card is MinionCard | HeroCard => {
  return isMinion(card) || isHero(card);
};

export const isDestiny = (card: AnyCard): card is DestinyCard => {
  return card.kind === CARD_KINDS.DESTINY;
};

export const minionOrHeroTargetRules = {
  canPlay: (
    game: Game,
    card: AnyCard,
    { predicate, min }: { predicate: (c: MinionCard | HeroCard) => boolean; min: number }
  ) => {
    return (
      [
        ...card.player.minions,
        card.player.hero,
        ...card.player.enemyMinions,
        card.player.enemyHero
      ].filter(c => c.canBeTargeted(card) && predicate(c)).length >= min
    );
  },
  getTargets: async ({
    game,
    card,
    timeoutFallback,
    predicate = () => true,
    min,
    max,
    allowRepeat,
    label,
    canCancel = false,
    aiHints
  }: {
    game: Game;
    card: AnyCard;
    timeoutFallback: AnyCard[];
    predicate: (c: MinionCard | HeroCard) => boolean;
    min: number;
    max: number;
    allowRepeat: boolean;
    label: string;
    canCancel?: boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }): Promise<InteractionResult<Targets<MinionCard | HeroCard>>> => {
    const result = await game.interaction.selectCardsOnBoard<MinionCard | HeroCard>({
      player: card.player,
      label,
      source: card,
      timeoutFallback,
      canCancel,
      aiHints,
      isElligible(candidate, selectedCards) {
        if (!isMinionOrHero(candidate)) {
          return false;
        }

        return (
          candidate.canBeTargeted(card) &&
          (allowRepeat || !selectedCards.some(selected => selected.equals(candidate))) &&
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
    if (result.cancelled) {
      return { cancelled: true as const, result: null };
    }
    return {
      cancelled: false as const,
      result: {
        cards: result.result as (MinionCard | HeroCard)[],
        spaces: [],
        effect: null
      }
    };
  }
};

export const singleEnemyTargetRules = {
  canPlay: (
    game: Game,
    card: AnyCard,
    predicate: (c: MinionCard | HeroCard) => boolean = () => true
  ) =>
    minionOrHeroTargetRules.canPlay(game, card, {
      predicate: c => {
        return !c.player.equals(card.player) && predicate(c);
      },
      min: 1
    }),
  getTargets: async ({
    game,
    card,
    label = 'Select an enemy',
    timeoutFallback,
    predicate = () => true,
    aiHints,
    canCancel = false
  }: {
    game: Game;
    card: AnyCard;
    label?: string;
    timeoutFallback: AnyCard[];
    canCancel?: boolean;
    predicate?: (c: MinionCard | HeroCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }) =>
    await minionOrHeroTargetRules.getTargets({
      game,
      card,
      predicate: c => {
        if (c.player.equals(card.player)) return false;
        return predicate(c);
      },
      min: 1,
      max: 1,
      allowRepeat: false,
      label,
      canCancel,
      aiHints,
      timeoutFallback
    }),
  defaultTimeoutFallback: (
    game: Game,
    card: AnyCard,
    predicate?: (c: MinionCard | HeroCard) => boolean
  ) => {
    const elligible = game.cardSystem.getAllCardsInPlay().filter(candidate => {
      if (!isMinion(candidate) && !isHero(candidate)) return false;

      return (
        candidate.isEnemy(card.player) &&
        candidate.canBeTargeted(card) &&
        predicate?.(candidate)
      );
    });

    return [elligible[0]];
  }
};

export const singleAllyTargetRules = {
  canPlay: (
    game: Game,
    card: AnyCard,
    predicate: (c: MinionCard | HeroCard) => boolean = () => true
  ) =>
    minionOrHeroTargetRules.canPlay(game, card, {
      predicate: c => c.player.equals(card.player) && predicate(c),
      min: 1
    }),
  getTargets: async ({
    game,
    card,
    label = 'Select an ally',
    timeoutFallback,
    predicate = () => true,
    aiHints,
    canCancel = false
  }: {
    game: Game;
    card: AnyCard;
    label?: string;
    timeoutFallback: AnyCard[];
    canCancel?: boolean;
    predicate?: (c: MinionCard | HeroCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }) =>
    await minionOrHeroTargetRules.getTargets({
      game,
      card,
      min: 1,
      max: 1,
      label,
      allowRepeat: false,
      canCancel,
      predicate,
      aiHints,
      timeoutFallback
    }),
  defaultTimeoutFallback: (
    game: Game,
    card: AnyCard,
    predicate?: (c: MinionCard | HeroCard) => boolean
  ) => {
    const elligible = game.cardSystem.getAllCardsInPlay().filter(candidate => {
      if (!isMinion(candidate) && !isHero(candidate)) return false;

      return (
        candidate.isAlly(card.player) &&
        candidate.canBeTargeted(card) &&
        predicate?.(candidate)
      );
    });

    return [elligible[0]];
  }
};

export const singleEnemyMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: MinionCard) => boolean = () => true) {
    return singleEnemyTargetRules.canPlay(game, card, c => {
      return isMinion(c) && predicate(c);
    });
  },
  async getTargets({
    game,
    card,
    label = 'Select an enemy minion',
    timeoutFallback,
    predicate = () => true,
    aiHints,
    canCancel = false
  }: {
    game: Game;
    card: AnyCard;
    label?: string;
    timeoutFallback: AnyCard[];
    predicate?: (c: MinionCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
    canCancel?: boolean;
  }) {
    const result = await singleEnemyTargetRules.getTargets({
      game,
      card,
      label,
      timeoutFallback,
      predicate: c => {
        return isMinion(c) && predicate(c);
      },
      aiHints,
      canCancel
    });
    if (result.cancelled) {
      return { cancelled: true as const, result: null };
    }
    return { cancelled: false as const, result: result.result as Targets<MinionCard> };
  },
  defaultTimeoutFallback: (
    game: Game,
    card: AnyCard,
    predicate?: (c: MinionCard) => boolean
  ) => {
    const elligible = game.cardSystem.getAllCardsInPlay().filter(candidate => {
      if (!isMinion(candidate)) return false;

      return (
        candidate.isEnemy(card.player) &&
        candidate.canBeTargeted(card) &&
        predicate?.(candidate)
      );
    });

    return [elligible[0]];
  }
};

export const singleAllyMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: MinionCard) => boolean = () => true) {
    return singleAllyTargetRules.canPlay(game, card, c => isMinion(c) && predicate(c));
  },
  async getTargets({
    game,
    card,
    label = 'Select an ally minion',
    timeoutFallback,
    predicate = () => true,
    aiHints
  }: {
    game: Game;
    card: AnyCard;
    label?: string;
    timeoutFallback: AnyCard[];
    predicate?: (c: MinionCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }) {
    const result = await singleAllyTargetRules.getTargets({
      game,
      card,
      label,
      timeoutFallback,
      predicate: c => isMinion(c) && predicate(c),
      aiHints
    });

    if (result.cancelled) {
      return { cancelled: true as const, result: null };
    }
    return { cancelled: false as const, result: result.result as Targets<MinionCard> };
  },
  defaultTimeoutFallback: (
    game: Game,
    card: AnyCard,
    predicate?: (c: MinionCard) => boolean
  ) => {
    const elligible = game.cardSystem.getAllCardsInPlay().filter(candidate => {
      if (!isMinion(candidate)) return false;

      return (
        candidate.isAlly(card.player) &&
        candidate.canBeTargeted(card) &&
        predicate?.(candidate)
      );
    });

    return [elligible[0]];
  }
};

export const singleMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: MinionCard) => boolean = () => true) {
    return minionOrHeroTargetRules.canPlay(game, card, {
      predicate: c => isMinion(c) && predicate(c),
      min: 1
    });
  },
  async getTargets({
    game,
    card,
    label = 'Select a minion',
    timeoutFallback,
    predicate = () => true,
    aiHints,
    canCancel = false
  }: {
    game: Game;
    card: AnyCard;
    label?: string;
    timeoutFallback: AnyCard[];
    canCancel?: boolean;
    predicate?: (c: MinionCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }) {
    const result = await minionOrHeroTargetRules.getTargets({
      min: 1,
      max: 1,
      label,
      allowRepeat: false,
      canCancel,
      game,
      card,
      predicate: c => isMinion(c) && predicate(c),
      timeoutFallback,
      aiHints
    });

    if (result.cancelled) {
      return { cancelled: true as const, result: null };
    }
    return { cancelled: false as const, result: result.result as Targets<MinionCard> };
  },
  defaultTimeoutFallback: (
    game: Game,
    card: AnyCard,
    predicate?: (c: MinionCard) => boolean
  ) => {
    const elligible = game.cardSystem.getAllCardsInPlay().filter(candidate => {
      if (!isMinion(candidate)) return false;

      return candidate.canBeTargeted(card) && predicate?.(candidate);
    });

    return [elligible[0]];
  }
};

export const multipleEnemyTargetRules = {
  canPlay(
    game: Game,
    card: AnyCard,
    min: number,
    predicate: (c: MinionCard | HeroCard) => boolean = () => true
  ) {
    return minionOrHeroTargetRules.canPlay(game, card, {
      predicate: c => !c.player.equals(card.player) && predicate(c),
      min
    });
  },
  async getTargets(
    game: Game,
    card: AnyCard,
    options: {
      min: number;
      max: number;
      allowRepeat?: boolean;
      label: string;
      predicate?: (c: MinionCard | HeroCard) => boolean;
      timeoutFallback: AnyCard[];
      aiHints: {
        shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
      };
    }
  ) {
    return await minionOrHeroTargetRules.getTargets({
      min: options.min,
      max: options.max,
      label: options.label,
      allowRepeat: options.allowRepeat ?? false,
      game,
      card,
      predicate: c => !c.player.equals(card.player) && (options.predicate?.(c) ?? true),
      timeoutFallback: options.timeoutFallback,
      aiHints: options.aiHints
    });
  }
};

export const cardsInAllyDiscardPile = {
  canPlay(
    game: Game,
    card: AnyCard,
    options: { min?: number; predicate: (c: AnyCard) => boolean }
  ) {
    return (
      Array.from(card.player.cardManager.discardPile).filter(c => {
        return options.predicate ? options.predicate(c) : true;
      }).length >= (options.min ?? 1)
    );
  },
  async getTargets<T extends AnyCard = AnyCard, TCancellable extends boolean = true>(
    game: Game,
    card: AnyCard,
    options: {
      player: Player;
      predicate?: (c: AnyCard) => boolean;
      minChoiceCount?: number;
      maxChoiceCount?: number;
      label: string;
      timeoutFallback: T[];
      canCancel?: TCancellable;
      aiHints: {
        shouldPick: (game: Game, player: Player, card: AnyCard) => number;
      };
    }
  ) {
    return await game.interaction.chooseCards<T, TCancellable>({
      player: options.player,
      label: options.label,
      canCancel: options.canCancel ?? (true as TCancellable),
      choices: Array.from(card.player.cardManager.discardPile)
        .filter(c => {
          return options.predicate ? options.predicate(c) : true;
        })
        .map(c => ({
          card: c,
          aiHints: {
            shouldPick: (game: Game, player: Player) =>
              options.aiHints.shouldPick(game, player, c)
          }
        })),
      timeoutFallback: options.timeoutFallback,
      minChoiceCount: options.minChoiceCount ?? 1,
      maxChoiceCount: options.maxChoiceCount ?? 1
    });
  }
};

export const cardsInEnemyDiscardPile = {
  canPlay(
    game: Game,
    card: AnyCard,
    options: { min?: number; predicate: (c: AnyCard) => boolean }
  ) {
    return (
      Array.from(card.player.opponent.cardManager.discardPile).filter(c => {
        return options.predicate ? options.predicate(c) : true;
      }).length >= (options.min ?? 1)
    );
  },
  async getTargets<T extends AnyCard = AnyCard, TCancellable extends boolean = true>(
    game: Game,
    card: AnyCard,
    options: {
      player: Player;
      predicate?: (c: AnyCard) => boolean;
      minChoiceCount?: number;
      maxChoiceCount?: number;
      label: string;
      timeoutFallback: T[];
      canCancel?: TCancellable;
      aiHints: {
        shouldPick: (game: Game, player: Player, card: AnyCard) => number;
      };
    }
  ) {
    return await game.interaction.chooseCards<T, TCancellable>({
      player: options.player,
      label: options.label,
      canCancel: (options.canCancel ?? true) as TCancellable,
      choices: Array.from(card.player.cardManager.discardPile)
        .filter(c => {
          return options.predicate ? options.predicate(c) : true;
        })
        .map(c => ({
          card: c,
          aiHints: {
            shouldPick: (game: Game, player: Player) =>
              options.aiHints.shouldPick(game, player, c)
          }
        })),
      timeoutFallback: options.timeoutFallback,
      minChoiceCount: options.minChoiceCount ?? 1,
      maxChoiceCount: options.maxChoiceCount ?? 1
    });
  }
};

export const defaultCardArt = (name: string): CardBlueprint['art'] => ({
  default: {
    foil: {
      oil: true,
      scanlines: true,
      brightShine: true,
      gradient: true
    },
    isFullArt: false,
    bg: `${name}-bg`,
    main: `${name}-main`
  }
});

export const noTargets = () =>
  Promise.resolve({
    cancelled: false as const,
    result: { cards: [], spaces: [], effect: null }
  });

export const emptyBoardSpaceTargetRules = {
  canPlay: (game: Game, predicate?: (space: BoardSpace) => boolean) =>
    game.boardSystem.boardSpaces.some(
      space => space.isEmpty && (predicate ? predicate(space) : true)
    ),

  getTargets: async <TCancellable extends boolean = true>({
    game,
    card,
    label = 'Select a space',
    timeoutFallback,
    predicate = () => true,
    canCancel
  }: {
    game: Game;
    card: AnyCard;
    label?: string | ((selectedSpaces: BoardSpace[]) => string);
    timeoutFallback?: BoardSpace[];
    predicate?: (space: BoardSpace) => boolean;
    canCancel?: TCancellable;
  }): Promise<
    InteractionResult<Targets> &
      (TCancellable extends true ? { cancelled: boolean } : { cancelled: false })
  > => {
    const result = await game.interaction.selectSpacesOnBoard<TCancellable>({
      source: card,
      player: card.player,
      canCancel: (canCancel ?? true) as TCancellable,
      getLabel: selectedSpaces =>
        isFunction(label)
          ? label(selectedSpaces)
          : (label ?? 'Select position to summon'),
      isElligible: space => {
        return space.isEmpty && predicate(space);
      },
      canCommit(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      isDone(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      timeoutFallback: timeoutFallback ?? [
        game.boardSystem.boardSpaces.find(
          space => space.isEmpty && (predicate ? predicate(space) : true)
        )!
      ],
      getAOE: () =>
        new PointAOEShape(game, {
          targetingType: AOE_TARGETING_TYPE.EMPTY,
          player: card.player
        })
    });

    if (result.cancelled) {
      return { cancelled: true as const, result: null };
    }
    return {
      cancelled: false as const,
      result: { spaces: result.result, cards: [], effect: null }
    };
  }
};

export const battlefieldTargetRules = {
  canPlay: (
    game: Game,
    predicate?: (battlefield: {
      space: BoardSpace;
      allySpaces: BoardSpace[];
      enemySpaces: BoardSpace[];
    }) => boolean
  ) =>
    game.boardSystem.boardSpaces.some(
      space =>
        (space.position.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
          space.position.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD) &&
        (predicate
          ? predicate({
              space,
              allySpaces: space.zone,
              enemySpaces: space.opponentZone
            })
          : true)
    ),

  getTargets: async ({
    game,
    card,
    label = 'Select a battlefi',
    timeoutFallback,
    predicate = () => true,
    canCancel = false
  }: {
    game: Game;
    card: AnyCard;
    label?: string | ((selectedSpaces: BoardSpace[]) => string);
    timeoutFallback?: BoardSpace[];
    predicate?: (battlefield: {
      space: BoardSpace;
      allySpaces: BoardSpace[];
      enemySpaces: BoardSpace[];
    }) => boolean;
    canCancel?: boolean;
  }): Promise<InteractionResult<Targets>> => {
    const result = await game.interaction.selectSpacesOnBoard({
      source: card,
      player: card.player,
      canCancel,
      getLabel: selectedSpaces =>
        isFunction(label)
          ? label(selectedSpaces)
          : (label ?? 'Select position to summon'),
      isElligible: space => {
        return (
          (space.position.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
            space.position.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD) &&
          (predicate
            ? predicate({
                space,
                allySpaces: space.zone,
                enemySpaces: space.opponentZone
              })
            : true)
        );
      },
      canCommit(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      isDone(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      timeoutFallback: timeoutFallback ?? [
        game.boardSystem.boardSpaces.find(
          space =>
            (space.position.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
              space.position.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD) &&
            (predicate
              ? predicate({
                  space,
                  allySpaces: space.zone,
                  enemySpaces: space.opponentZone
                })
              : true)
        )!
      ],
      getAOE: () =>
        new PointAOEShape(game, {
          targetingType: AOE_TARGETING_TYPE.EMPTY,
          player: card.player
        })
    });

    if (result.cancelled) {
      return { cancelled: true as const, result: null };
    }
    return {
      cancelled: false as const,
      result: { spaces: result.result, cards: [], effect: null }
    };
  }
};

export const anywhereTargetRules = {
  canPlay: (game: Game, predicate?: (space: BoardSpace) => boolean) =>
    game.boardSystem.boardSpaces.some(space => (predicate ? predicate(space) : true)),

  getTargets: async ({
    game,
    card,
    label = 'Select a space',
    timeoutFallback,
    predicate = () => true,
    canCancel = false
  }: {
    game: Game;
    card: AnyCard;
    label?: string | ((selectedSpaces: BoardSpace[]) => string);
    timeoutFallback?: BoardSpace[];
    predicate?: (space: BoardSpace) => boolean;
    canCancel?: boolean;
  }): Promise<InteractionResult<Targets>> => {
    const result = await game.interaction.selectSpacesOnBoard({
      source: card,
      player: card.player,
      canCancel,
      getLabel: selectedSpaces =>
        isFunction(label) ? label(selectedSpaces) : (label ?? 'Select a space'),
      isElligible: space => {
        return predicate(space);
      },
      canCommit(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      isDone(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      timeoutFallback: timeoutFallback ?? [
        game.boardSystem.boardSpaces.find(space => (predicate ? predicate(space) : true))!
      ],
      getAOE: () =>
        new PointAOEShape(game, {
          targetingType: AOE_TARGETING_TYPE.EMPTY,
          player: card.player
        })
    });

    if (result.cancelled) {
      return { cancelled: true as const, result: null };
    }
    return {
      cancelled: false as const,
      result: { spaces: result.result, cards: [], effect: null }
    };
  }
};

export const effectTargetRules = {
  canPlay: (game: Game, card: AnyCard, predicate?: (effect: Effect) => boolean) =>
    !!game.effectChainSystem.currentChain?.stack.some(effect =>
      predicate ? predicate(effect) : true
    ),

  getTargets: async ({
    game,
    card,
    label = 'Select an effect',
    timeoutFallback,
    predicate = () => true,
    canCancel = false
  }: {
    game: Game;
    card: AnyCard;
    label?: string;
    timeoutFallback?: Effect;
    predicate?: (effect: Effect) => boolean;
    canCancel?: boolean;
  }): Promise<InteractionResult<Targets>> => {
    const result = await game.interaction.chooseChainEffect({
      source: card,
      player: card.player,
      canCancel,
      label,
      isElligible: effect => {
        return predicate(effect);
      },
      timeoutFallback:
        timeoutFallback ??
        game.effectChainSystem.currentChain!.stack.find(effect =>
          predicate ? predicate(effect) : true
        )!,
      aiHints: {
        shouldPick: () => {
          return 0;
        }
      }
    });

    if (result.cancelled) {
      return { cancelled: true as const, result: null };
    }
    return {
      cancelled: false as const,
      result: { spaces: [], cards: [], effect: result.result }
    };
  }
};
