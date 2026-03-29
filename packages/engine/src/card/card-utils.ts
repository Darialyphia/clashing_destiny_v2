import type { Game } from '../game/game';
import { UntilEndOfTurnModifierMixin } from '../modifier/mixins/until-end-of-turn.mixin';
import { SimpleAttackBuffModifier } from '../modifier/modifiers/simple-attack-buff.modifier';
import type { Player } from '../player/player.entity';
import type { CardBlueprint } from './card-blueprint';
import { CARD_KINDS, CARD_LOCATIONS, type CardTint, type Job } from './card.enums';
import type { ArtifactCard } from './entities/artifact.entity';
import type { AnyCard, CardTargetOrigin } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SpellCard } from './entities/spell.entity';

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

export const minionOrHeroTargetRules = {
  canPlay:
    (min: number) =>
    (
      game: Game,
      card: AnyCard,
      predicate: (c: MinionCard | HeroCard) => boolean = () => true
    ) => {
      return (
        [...card.player.allAllies, ...card.player.allEnemies].filter(
          c => c.canBeTargeted(card) && predicate(c)
        ).length >= min
      );
    },
  getPreResponseTargets:
    ({
      min,
      max,
      allowRepeat,
      label
    }: {
      min: number;
      max: number;
      allowRepeat: boolean;
      label: string;
    }) =>
    async ({
      game,
      card,
      origin,
      timeoutFallback,
      predicate = () => true,
      aiHints
    }: {
      game: Game;
      card: AnyCard;
      origin: CardTargetOrigin;
      timeoutFallback: AnyCard[];
      predicate: (c: MinionCard | HeroCard | ArtifactCard) => boolean;
      aiHints: {
        shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
      };
    }) => {
      return await game.interaction.selectCardsOnBoard<MinionCard | HeroCard>({
        player: card.player,
        origin,
        label,
        timeoutFallback,
        aiHints,
        isElligible(candidate, selectedCards) {
          if (!isMinionOrHero(candidate)) {
            return false;
          }

          return (
            [...card.player.allAllies, ...card.player.allEnemies].some(enemy =>
              enemy.equals(candidate)
            ) &&
            candidate.canBeTargeted(card) &&
            (allowRepeat ||
              !selectedCards.some(selected => selected.equals(candidate))) &&
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

export const singleEnemyTargetRules = {
  canPlay: (
    game: Game,
    card: AnyCard,
    predicate: (c: MinionCard | HeroCard | ArtifactCard) => boolean = () => true
  ) =>
    minionOrHeroTargetRules.canPlay(1)(
      game,
      card,
      c => !c.player.equals(card.player) && predicate(c)
    ),
  getPreResponseTargets: async ({
    game,
    card,
    origin,
    label,
    timeoutFallback,
    predicate = () => true,
    aiHints
  }: {
    game: Game;
    card: AnyCard;
    origin: CardTargetOrigin;
    label: string;
    timeoutFallback: AnyCard[];
    predicate?: (c: MinionCard | HeroCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }) =>
    await minionOrHeroTargetRules.getPreResponseTargets({
      min: 1,
      max: 1,
      allowRepeat: false,
      label
    })({
      game,
      card,
      origin,
      predicate: card => {
        if (!isMinion(card) && !isHero(card)) return false;
        return predicate(card);
      },
      aiHints,
      timeoutFallback
    })
};

export const singleAllyTargetRules = {
  canPlay: (
    game: Game,
    card: AnyCard,
    predicate: (c: MinionCard | HeroCard) => boolean = () => true
  ) =>
    minionOrHeroTargetRules.canPlay(1)(
      game,
      card,
      c => c.player.equals(card.player) && predicate(c)
    ),
  getPreResponseTargets: async ({
    game,
    card,
    origin,
    label,
    timeoutFallback,
    predicate = () => true,
    aiHints
  }: {
    game: Game;
    card: AnyCard;
    origin: CardTargetOrigin;
    label: string;
    timeoutFallback: AnyCard[];
    predicate?: (c: MinionCard | HeroCard | ArtifactCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }) =>
    await minionOrHeroTargetRules.getPreResponseTargets({
      min: 1,
      max: 1,
      label,
      allowRepeat: false
    })({ game, card, origin, predicate, aiHints, timeoutFallback })
};

export const singleEnemyMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: MinionCard) => boolean = () => true) {
    return singleEnemyTargetRules.canPlay(game, card, c => isMinion(c) && predicate(c));
  },
  async getPreResponseTargets({
    game,
    card,
    origin,
    label,
    timeoutFallback,
    predicate = () => true,
    aiHints
  }: {
    game: Game;
    card: AnyCard;
    label: string;
    origin: CardTargetOrigin;
    timeoutFallback: AnyCard[];
    predicate?: (c: MinionCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }) {
    return (await singleEnemyTargetRules.getPreResponseTargets({
      game,
      card,
      origin,
      label,
      timeoutFallback,
      predicate: c => isMinion(c) && predicate(c),
      aiHints
    })) as MinionCard[];
  }
};

export const singleAllyMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: MinionCard) => boolean = () => true) {
    return singleAllyTargetRules.canPlay(game, card, c => isMinion(c) && predicate(c));
  },
  async getPreResponseTargets({
    game,
    card,
    origin,
    label,
    timeoutFallback,
    predicate = () => true,
    aiHints
  }: {
    game: Game;
    card: AnyCard;
    origin: CardTargetOrigin;
    label: string;
    timeoutFallback: AnyCard[];
    predicate?: (c: MinionCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }) {
    return (await singleAllyTargetRules.getPreResponseTargets({
      game,
      card,
      origin,
      label,
      timeoutFallback,
      predicate: c => isMinion(c) && predicate(c),
      aiHints
    })) as MinionCard[];
  }
};

export const singleMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: MinionCard) => boolean = () => true) {
    return minionOrHeroTargetRules.canPlay(1)(
      game,
      card,
      c => isMinion(c) && predicate(c)
    );
  },
  async getPreResponseTargets({
    game,
    card,
    origin,
    label,
    timeoutFallback,
    predicate = () => true,
    aiHints
  }: {
    game: Game;
    card: AnyCard;
    origin: CardTargetOrigin;
    label: string;
    timeoutFallback: AnyCard[];
    predicate?: (c: MinionCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }) {
    return (await minionOrHeroTargetRules.getPreResponseTargets({
      min: 1,
      max: 1,
      label,
      allowRepeat: false
    })({
      game,
      card,
      origin,
      predicate: c => isMinion(c) && predicate(c),
      timeoutFallback,
      aiHints
    })) as MinionCard[];
  }
};

export const multipleEnemyTargetRules = {
  canPlay(
    game: Game,
    card: AnyCard,
    min: number,
    predicate: (c: MinionCard | HeroCard) => boolean = () => true
  ) {
    return minionOrHeroTargetRules.canPlay(min)(
      game,
      card,
      c => !c.player.equals(card.player) && predicate(c)
    );
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    origin: CardTargetOrigin,
    options: {
      min: number;
      max: number;
      allowRepeat?: boolean;
      label: string;
      predicate?: (c: MinionCard | HeroCard | ArtifactCard) => boolean;
      timeoutFallback: AnyCard[];
      aiHints: {
        shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
      };
    }
  ) {
    return await minionOrHeroTargetRules.getPreResponseTargets({
      min: options.min,
      max: options.max,
      label: options.label,
      allowRepeat: options.allowRepeat ?? false
    })({
      game,
      card,
      origin,
      predicate: c => !c.player.equals(card.player) && (options.predicate?.(c) ?? true),
      timeoutFallback: options.timeoutFallback,
      aiHints: options.aiHints
    });
  }
};
export const singleArtifactTargetRules = {
  canPlay(
    game: Game,
    card: AnyCard,
    predicate: (c: ArtifactCard) => boolean = () => true
  ) {
    return (
      game.boardSystem.getAllCardsInPlay().filter(c => isArtifact(c) && predicate(c))
        .length > 0
    );
  },
  async getPreResponseTargets({
    game,
    card,
    origin,
    label,
    timeoutFallback,
    predicate = () => true,
    aiHints
  }: {
    game: Game;
    card: AnyCard;
    origin: CardTargetOrigin;
    label: string;
    timeoutFallback: AnyCard[];
    predicate: (c: ArtifactCard) => boolean;
    aiHints: {
      shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
    };
  }) {
    return await game.interaction.selectCardsOnBoard<ArtifactCard>({
      origin,
      label,
      player: card.player,
      timeoutFallback,
      aiHints,
      isElligible(candidate, selectedCards) {
        if (!isArtifact(candidate)) {
          return false;
        }

        return (
          game.boardSystem
            .getAllCardsInPlay()
            .some(artifact => artifact.equals(candidate)) &&
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
  async getPreResponseTargets<T extends AnyCard = AnyCard>(
    game: Game,
    card: AnyCard,
    options: {
      player: Player;
      predicate?: (c: AnyCard) => boolean;
      minChoiceCount?: number;
      maxChoiceCount?: number;
      label: string;
      timeoutFallback: T[];
      aiHints: {
        shouldPick: (game: Game, player: Player, card: AnyCard) => number;
      };
    }
  ) {
    return await game.interaction.chooseCards<T>({
      player: options.player,
      label: options.label,
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
  async getPreResponseTargets<T extends AnyCard = AnyCard>(
    game: Game,
    card: AnyCard,
    options: {
      player: Player;
      predicate?: (c: AnyCard) => boolean;
      minChoiceCount?: number;
      maxChoiceCount?: number;
      label: string;
      timeoutFallback: T[];
      aiHints: {
        shouldPick: (game: Game, player: Player, card: AnyCard) => number;
      };
    }
  ) {
    return await game.interaction.chooseCards<T>({
      player: options.player,
      label: options.label,
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

export const equipWeapon = (options: {
  durabilityCost: number;
  manaCost: number;
  modifierType: string;
  onResolve?: (game: Game, card: ArtifactCard) => Promise<void>;
}) => {
  return {
    id: 'equip-weapon-ability',
    description: '@Equip Weapon@',
    label: 'Equip Weapon',
    canUse: (game: Game, card: ArtifactCard) => card.location === CARD_LOCATIONS.BASE,
    getPreResponseTargets: () => Promise.resolve([]),
    manaCost: options.manaCost,
    shouldExhaust: true,
    durabilityCost: options.durabilityCost,
    onResolve: async (game: Game, card: ArtifactCard) => {
      await card.player.hero.modifiers.add(
        new SimpleAttackBuffModifier(options.modifierType, game, card, {
          amount: card.atkBonus ?? 0,
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
      await options.onResolve?.(game, card);
    }
  };
};

export const defaultCardArt = (name: string, tint: CardTint): CardBlueprint['art'] => ({
  default: {
    foil: {
      sheen: true,
      lightGradient: true
    },
    isFullArt: false,
    dimensions: {
      width: 162,
      height: 121
    },
    bg: `${name}-bg`,
    main: `${name}`
  }
});
