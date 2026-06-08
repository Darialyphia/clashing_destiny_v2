import type { Game } from '../game/game';
import type { InteractionResult } from '../game/systems/game-interaction.system';
import type { Player } from '../player/player.entity';
import type { CardBlueprint, Targets } from './card-blueprint';
import { CARD_KINDS } from './card.enums';
import type { AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SpellCard } from './entities/spell.entity';
import type { TrapCard } from './entities/trap.entity';

export const isHero = (card: AnyCard): card is HeroCard => {
  return card.kind === CARD_KINDS.HERO;
};

export const isMinion = (card: AnyCard): card is MinionCard => {
  return card.kind === CARD_KINDS.MINION;
};

export const isSpell = (card: AnyCard): card is SpellCard => {
  return card.kind === CARD_KINDS.SPELL;
};

export const isTrap = (card: AnyCard): card is TrapCard => {
  return card.kind === CARD_KINDS.TRAP;
};

export const isMinionOrHero = (card: AnyCard): card is MinionCard | HeroCard => {
  return isMinion(card) || isHero(card);
};

export const minionOrHeroTargetRules = {
  canPlay: (
    game: Game,
    card: AnyCard,
    { predicate, min }: { predicate: (c: MinionCard | HeroCard) => boolean; min: number }
  ) => {
    return (
      [...card.player.minions, card.player.hero].filter(
        c => c.canBeTargeted(card) && predicate(c)
      ).length >= min
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
      timeoutFallback,
      canCancel,
      aiHints,
      isElligible(candidate, selectedCards) {
        if (!isMinionOrHero(candidate)) {
          return false;
        }

        return (
          [...card.player.minions, card.player.hero].some(enemy =>
            enemy.equals(candidate)
          ) &&
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
      result: { cards: result.result as (MinionCard | HeroCard)[] }
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
      predicate: c => !c.player.equals(card.player) && predicate(c),
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
      predicate: card => {
        if (!isMinion(card) && !isHero(card)) return false;
        return predicate(card);
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
    return singleEnemyTargetRules.canPlay(game, card, c => isMinion(c) && predicate(c));
  },
  async getTargets({
    game,
    card,
    label = 'Select an enemy minion',
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
    const result = await singleEnemyTargetRules.getTargets({
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
  async getTargets<T extends AnyCard = AnyCard>(
    game: Game,
    card: AnyCard,
    options: {
      player: Player;
      predicate?: (c: AnyCard) => boolean;
      minChoiceCount?: number;
      maxChoiceCount?: number;
      label: string;
      timeoutFallback: T[];
      canCancel?: boolean;
      aiHints: {
        shouldPick: (game: Game, player: Player, card: AnyCard) => number;
      };
    }
  ) {
    return await game.interaction.chooseCards<T>({
      player: options.player,
      label: options.label,
      canCancel: options.canCancel ?? false,
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
  async getTargets<T extends AnyCard = AnyCard>(
    game: Game,
    card: AnyCard,
    options: {
      player: Player;
      predicate?: (c: AnyCard) => boolean;
      minChoiceCount?: number;
      maxChoiceCount?: number;
      label: string;
      timeoutFallback: T[];
      canCancel?: boolean;
      aiHints: {
        shouldPick: (game: Game, player: Player, card: AnyCard) => number;
      };
    }
  ) {
    return await game.interaction.chooseCards<T>({
      player: options.player,
      label: options.label,
      canCancel: options.canCancel ?? false,
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
      sheen: true,
      lightGradient: true,
      scanlines: true,
      glitter: true
    },
    isFullArt: false,
    bg: `${name}-bg`,
    main: `${name}-main`
  }
});

export const noTargets = () =>
  Promise.resolve({ cancelled: false as const, result: { cards: [], spaces: [] } });
