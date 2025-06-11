import type { Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Attacker, Defender, AttackTarget } from '../../game/phases/combat.phase';

import type { Player } from '../../player/player.entity';
import type { CombatDamage, Damage, DamageType } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import {
  serializePreResponseTarget,
  type Ability,
  type HeroBlueprint,
  type PreResponseTarget,
  type SerializedAbility
} from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';

export type SerializedHeroCard = SerializedCard & {
  level: number;
  destinyCost: number;
  potentialAttackTargets: string[];
  atk: number;
  baseAtk: number;
  spellPower: number;
  baseSpellPower: number;
  maxHp: number;
  baseMaxHp: number;
  remainingHp: number;
  abilities: SerializedAbility[];
  unlockableAffinities: string[];
};
export type HeroCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, HeroCard>;
  canBlock: Interceptable<boolean, { attacker: Attacker }>;
  canBeBlocked: Interceptable<boolean, { blocker: Defender }>;
  canAttack: Interceptable<boolean, { target: AttackTarget }>;
  canBeAttacked: Interceptable<boolean, { target: AttackTarget }>;
  canBeDefended: Interceptable<boolean, { defender: Defender }>;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  canUseAbility: Interceptable<boolean, { ability: Ability<HeroCard, any> }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, HeroCard>;
  atk: Interceptable<number, HeroCard>;
  spellPower: Interceptable<number, HeroCard>;
};

export const HERO_EVENTS = {
  HERO_BEFORE_TAKE_DAMAGE: 'hero.before-take-damage',
  HERO_AFTER_TAKE_DAMAGE: 'hero.after-take-damage',
  HERO_BEFORE_DEAL_COMBAT_DAMAGE: 'hero.before-deal-combat-damage',
  HERO_AFTER_DEAL_COMBAT_DAMAGE: 'hero.after-deal-combat-damage',
  HERO_BEFORE_HEAL: 'hero.before-heal',
  HERO_AFTER_HEAL: 'hero.after-heal',
  HERO_BEFORE_USE_ABILITY: 'hero.before-use-ability',
  HERO_AFTER_USE_ABILITY: 'hero.after-use-ability',
  HERO_BEFORE_LEVEL_UP: 'hero.before-level-up',
  HERO_AFTER_LEVEL_UP: 'hero.after-level-up'
} as const;
export type HeroEvents = Values<typeof HERO_EVENTS>;

export class HeroCardTakeDamageEvent extends TypedSerializableEvent<
  { card: HeroCard; damage: Damage },
  { card: SerializedHeroCard; damage: { type: DamageType; amount: number } }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      }
    };
  }
}

export class HeroDealCombatDamageEvent extends TypedSerializableEvent<
  {
    card: HeroCard;
    target: AttackTarget;
    damage: CombatDamage;
  },
  { card: SerializedHeroCard; target: string; damage: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      target: this.data.target.id,
      damage: this.data.damage.getFinalAmount(this.data.target)
    };
  }
}

export class HeroCardHealEvent extends TypedSerializableEvent<
  { card: HeroCard; amount: number },
  { card: SerializedHeroCard; amount: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      amount: this.data.amount
    };
  }
}

export class HeroUsedAbilityEvent extends TypedSerializableEvent<
  { card: HeroCard; abilityId: string },
  { card: SerializedHeroCard; abilityId: string }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      abilityId: this.data.abilityId
    };
  }
}

export class HeroLevelUpEvent extends TypedSerializableEvent<
  { card: HeroCard; to: HeroCard },
  { card: SerializedHeroCard; to: string }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      to: this.data.to.id
    };
  }
}

export type HeroCardEventMap = {
  [HERO_EVENTS.HERO_BEFORE_TAKE_DAMAGE]: HeroCardTakeDamageEvent;
  [HERO_EVENTS.HERO_AFTER_TAKE_DAMAGE]: HeroCardTakeDamageEvent;
  [HERO_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE]: HeroDealCombatDamageEvent;
  [HERO_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE]: HeroDealCombatDamageEvent;
  [HERO_EVENTS.HERO_BEFORE_HEAL]: HeroCardHealEvent;
  [HERO_EVENTS.HERO_AFTER_HEAL]: HeroCardHealEvent;
  [HERO_EVENTS.HERO_BEFORE_USE_ABILITY]: HeroUsedAbilityEvent;
  [HERO_EVENTS.HERO_AFTER_USE_ABILITY]: HeroUsedAbilityEvent;
  [HERO_EVENTS.HERO_BEFORE_LEVEL_UP]: HeroLevelUpEvent;
  [HERO_EVENTS.HERO_AFTER_LEVEL_UP]: HeroLevelUpEvent;
};

export class HeroCard extends Card<SerializedCard, HeroCardInterceptors, HeroBlueprint> {
  private damageTaken = 0;

  private lineage: HeroBlueprint[] = [];

  private abilityTargets = new Map<string, PreResponseTarget[]>();

  constructor(game: Game, player: Player, options: CardOptions<HeroBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canBlock: new Interceptable(),
        canBeBlocked: new Interceptable(),
        canAttack: new Interceptable(),
        canBeAttacked: new Interceptable(),
        canBeDefended: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        spellPower: new Interceptable()
      },
      options
    );
  }

  get level() {
    return this.blueprint.level;
  }

  get isAlive() {
    return this.remainingHp > 0 && this.location === 'board';
  }

  get atk(): number {
    const weapon = this.player.artifactManager.artifacts.weapon;
    const baseAttack = this.blueprint.atk + (weapon?.atk ?? 0);
    return this.interceptors.atk.getValue(baseAttack, this);
  }

  get spellPower(): number {
    return this.interceptors.spellPower.getValue(this.blueprint.spellPower, this);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  get remainingHp(): number {
    return Math.max(this.maxHp - this.damageTaken, 0);
  }

  get unlockableAffinities() {
    return this.blueprint.unlockableAffinities;
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  canAttack(target: AttackTarget) {
    return this.interceptors.canAttack.getValue(!this._isExhausted && this.atk > 0, {
      target
    });
  }

  canBeAttacked(target: AttackTarget) {
    return this.interceptors.canBeAttacked.getValue(true, {
      target
    });
  }

  canBeDefendedBy(defender: Defender) {
    return this.interceptors.canBeDefended.getValue(true, {
      defender
    });
  }

  canBlock(attacker: Attacker) {
    return this.interceptors.canBlock.getValue(false, {
      attacker
    });
  }

  canBeBlocked(blocker: Defender) {
    return this.interceptors.canBeBlocked.getValue(true, {
      blocker
    });
  }

  getReceivedDamage(damage: Damage) {
    return this.interceptors.receivedDamage.getValue(damage.baseAmount, {
      damage
    });
  }

  async dealDamage(target: AttackTarget, damage: CombatDamage) {
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE,
      new HeroDealCombatDamageEvent({ card: this, target, damage })
    );

    await target.takeDamage(this, damage);

    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE,
      new HeroDealCombatDamageEvent({ card: this, target, damage })
    );
  }

  async takeDamage(source: AnyCard, damage: Damage) {
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_TAKE_DAMAGE,
      new HeroCardTakeDamageEvent({ card: this, damage })
    );

    const amount = damage.getFinalAmount(this);

    const armor = this.player.artifactManager.artifacts.armor;
    if (armor) {
      const absorbed = Math.min(armor.remainingDurability, amount);
      await armor.loseDurability(absorbed);

      this.damageTaken = Math.min(this.damageTaken + amount - absorbed, this.maxHp);
    } else {
      this.damageTaken = Math.min(this.damageTaken + amount, this.maxHp);
    }

    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_TAKE_DAMAGE,
      new HeroCardTakeDamageEvent({ card: this, damage })
    );
  }

  async heal(heal: number) {
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_HEAL,
      new HeroCardHealEvent({ card: this, amount: heal })
    );
    this.damageTaken = Math.max(this.damageTaken - heal, 0);
    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_HEAL,
      new HeroCardHealEvent({ card: this, amount: heal })
    );
  }

  canUseAbility(id: string) {
    const ability = this.blueprint.abilities.find(ability => ability.id === id);
    if (!ability) return false;

    const authorizedPhases: GamePhase[] = [
      GAME_PHASES.MAIN,
      GAME_PHASES.ATTACK,
      GAME_PHASES.END
    ];

    return this.interceptors.canUseAbility.getValue(
      this.player.cardManager.hand.length >= ability.manaCost &&
        authorizedPhases.includes(this.game.gamePhaseSystem.getContext().state) &&
        this.game.effectChainSystem.currentChain
        ? this.game.effectChainSystem.currentChain.canAddEffect(this.player)
        : this.game.gamePhaseSystem.turnPlayer.equals(this.player) &&
            (ability.shouldExhaust
              ? !this.isExhausted
              : true && ability.canUse(this.game, this)),
      { ability }
    );
  }

  async useAbility(id: string) {
    const ability = this.blueprint.abilities.find(ability => ability.id === id);
    if (!ability) return;

    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_USE_ABILITY,
      new HeroUsedAbilityEvent({ card: this, abilityId: id })
    );
    const targets = await ability.getPreResponseTargets(this.game, this);
    this.abilityTargets.set(id, targets);

    if (ability.shouldExhaust) {
      await this.exhaust();
    }

    const effect = {
      source: this,
      targets,
      handler: async () => {
        await ability.onResolve(this.game, this, targets);
        this.abilityTargets.delete(id);
        await this.game.emit(
          HERO_EVENTS.HERO_AFTER_USE_ABILITY,
          new HeroUsedAbilityEvent({ card: this, abilityId: id })
        );
      }
    };

    if (this.game.effectChainSystem.currentChain) {
      this.game.effectChainSystem.addEffect(effect, this.player);
    } else {
      void this.game.effectChainSystem.createChain(this.player, effect);
    }
  }

  canPlay() {
    return (
      this.location === 'destinyDeck' &&
      this.canPayDestinyCost &&
      this.game.gamePhaseSystem.getContext().state === GAME_PHASES.DESTINY &&
      (!this.blueprint.lineage || this.player.hero.hasLineage(this.blueprint.lineage)) &&
      this.blueprint.level - this.player.hero.level === 1
    );
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.updatePlayedAt();

    if (this.level > 0) {
      const affinity = await this.game.interaction.chooseAffinity({
        player: this.player,
        choices: this.unlockableAffinities
      });
      if (affinity) {
        await this.player.unlockAffinity(affinity);
      }
      await this.player.hero.levelup(this);
    } else {
      await this.blueprint.onPlay(this.game, this);
    }

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  async levelup(hero: HeroCard) {
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_LEVEL_UP,
      new HeroLevelUpEvent({ card: this, to: hero })
    );
    this.damageTaken = 0; // Reset damage taken on level up
    this.lineage.push(this.blueprint);
    this.blueprint = hero.blueprint;
    await this.blueprint.onPlay(this.game, this);
    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_LEVEL_UP,
      new HeroLevelUpEvent({ card: this, to: hero })
    );
  }

  hasLineage(lineage: string) {
    return this.lineage.some(l => l.id === lineage) || this.blueprint.id === lineage;
  }

  get potentialAttackTargets() {
    return this.player.opponent.boardSide
      .getAllAttackTargets()
      .filter(target => this.canAttack(target));
  }

  serialize(): SerializedHeroCard {
    return {
      ...this.serializeBase(),
      destinyCost: this.destinyCost,
      level: this.level,
      potentialAttackTargets: this.potentialAttackTargets.map(target => target.id),
      atk: this.atk,
      baseAtk: this.blueprint.atk,
      spellPower: this.spellPower,
      baseSpellPower: this.blueprint.spellPower,
      maxHp: this.maxHp,
      baseMaxHp: this.blueprint.maxHp,
      remainingHp: this.maxHp - this.damageTaken,
      unlockableAffinities: this.blueprint.unlockableAffinities,
      abilities: this.blueprint.abilities.map(ability => ({
        id: ability.id,
        canUse: this.canUseAbility(ability.id),
        name: ability.label,
        description: ability.description,
        targets:
          this.abilityTargets.get(ability.id)?.map(serializePreResponseTarget) ?? null
      }))
    };
  }
}
