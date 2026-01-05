import type { Game } from '../game/game';
import { UntilEndOfTurnModifierMixin } from '../modifier/mixins/until-end-of-turn.mixin';
import { SimpleAttackBuffModifier } from '../modifier/modifiers/simple-attack-buff.modifier';
import type { Player } from '../player/player.entity';
import { CARD_KINDS, CARD_LOCATIONS, type CardSpeed } from './card.enums';
import type { ArtifactCard } from './entities/artifact.entity';
import type { AnyCard, CardTargetOrigin } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SigilCard } from './entities/sigil.entity';
import type { SpellCard } from './entities/spell.entity';

export const isHero = (card: AnyCard): card is HeroCard => {
  return card.kind === CARD_KINDS.HERO;
};

export const isMinion = (card: AnyCard): card is MinionCard => {
  return card.kind === CARD_KINDS.MINION;
};

export const isSigil = (card: AnyCard): card is SigilCard => {
  return card.kind === CARD_KINDS.SIGIL;
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
    ({ min, max, allowRepeat }: { min: number; max: number; allowRepeat: boolean }) =>
    async (
      game: Game,
      card: AnyCard,
      origin: CardTargetOrigin,
      predicate: (c: MinionCard | HeroCard) => boolean = () => true
    ) => {
      return await game.interaction.selectCardsOnBoard<MinionCard | HeroCard>({
        player: card.player,
        origin,
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
    predicate: (c: MinionCard | HeroCard) => boolean = () => true
  ) =>
    minionOrHeroTargetRules.canPlay(1)(
      game,
      card,
      c => !c.player.equals(card.player) && predicate(c)
    ),
  getPreResponseTargets: async (
    game: Game,
    card: AnyCard,
    origin: CardTargetOrigin,
    predicate: (c: MinionCard | HeroCard) => boolean = () => true
  ) =>
    await minionOrHeroTargetRules.getPreResponseTargets({
      min: 1,
      max: 1,
      allowRepeat: false
    })(game, card, origin, predicate)
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
  getPreResponseTargets: async (
    game: Game,
    card: AnyCard,
    origin: CardTargetOrigin,
    predicate: (c: MinionCard | HeroCard) => boolean = () => true
  ) =>
    await minionOrHeroTargetRules.getPreResponseTargets({
      min: 1,
      max: 1,
      allowRepeat: false
    })(game, card, origin, predicate)
};

export const singleEnemyMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: MinionCard) => boolean = () => true) {
    return singleEnemyTargetRules.canPlay(game, card, c => isMinion(c) && predicate(c));
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    origin: CardTargetOrigin,
    predicate: (c: MinionCard) => boolean = () => true
  ) {
    return (await singleEnemyTargetRules.getPreResponseTargets(
      game,
      card,
      origin,
      c => isMinion(c) && predicate(c)
    )) as MinionCard[];
  }
};

export const singleAllyMinionTargetRules = {
  canPlay(game: Game, card: AnyCard, predicate: (c: MinionCard) => boolean = () => true) {
    return singleAllyTargetRules.canPlay(game, card, c => isMinion(c) && predicate(c));
  },
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    origin: CardTargetOrigin,
    predicate: (c: MinionCard) => boolean = () => true
  ) {
    return (await singleAllyTargetRules.getPreResponseTargets(
      game,
      card,
      origin,
      c => isMinion(c) && predicate(c)
    )) as MinionCard[];
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
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    origin: CardTargetOrigin,
    predicate: (c: MinionCard) => boolean = () => true
  ) {
    return (await minionOrHeroTargetRules.getPreResponseTargets({
      min: 1,
      max: 1,
      allowRepeat: false
    })(game, card, origin, c => isMinion(c) && predicate(c))) as MinionCard[];
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
      predicate?: (c: MinionCard | HeroCard) => boolean;
    }
  ) {
    return await minionOrHeroTargetRules.getPreResponseTargets({
      min: options.min,
      max: options.max,
      allowRepeat: options.allowRepeat ?? false
    })(
      game,
      card,
      origin,
      c => !c.player.equals(card.player) && (options.predicate?.(c) ?? true)
    );
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
  async getPreResponseTargets(
    game: Game,
    card: AnyCard,
    origin: CardTargetOrigin,
    predicate: (c: ArtifactCard) => boolean = () => true
  ) {
    return await game.interaction.selectCardsOnBoard<ArtifactCard>({
      origin,
      player: card.player,
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
    }
  ) {
    return await game.interaction.chooseCards<T>({
      player: options.player,
      label: options.label,
      choices: Array.from(card.player.cardManager.discardPile).filter(c => {
        return options.predicate ? options.predicate(c) : true;
      }) as T[],
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
    }
  ) {
    return await game.interaction.chooseCards<T>({
      player: options.player,
      label: options.label,
      choices: Array.from(card.player.opponent.cardManager.discardPile).filter(c => {
        return options.predicate ? options.predicate(c) : true;
      }) as T[],
      minChoiceCount: options.minChoiceCount ?? 1,
      maxChoiceCount: options.maxChoiceCount ?? 1
    });
  }
};

export const equipWeapon = (options: {
  durabilityCost: number;
  manaCost: number;
  speed: CardSpeed;
  modifierType: string;
}) => {
  return {
    id: 'equip-weapon-ability',
    description: '@Equip Weapon@',
    label: 'Equip Weapon',
    canUse: (game: Game, card: ArtifactCard) => card.location === CARD_LOCATIONS.BOARD,
    getPreResponseTargets: () => Promise.resolve([]),
    manaCost: options.manaCost,
    shouldExhaust: true,
    speed: options.speed,
    durabilityCost: options.durabilityCost,
    onResolve: async (game: Game, card: ArtifactCard) => {
      await card.player.hero.modifiers.add(
        new SimpleAttackBuffModifier(options.modifierType, game, card, {
          amount: card.atkBonus ?? 0,
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
    }
  };
};
