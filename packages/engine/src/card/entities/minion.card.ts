import type { Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Attacker, Defender, AttackTarget } from '../../game/phases/combat.phase';
import type { Player } from '../../player/player.entity';
import type { Damage, DamageType } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import type { MinionBlueprint, SerializedAbility } from '../card-blueprint';
import { CARD_EVENTS, type Affinity } from '../card.enums';
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
import type { MinionPosition } from '../../game/interactions/selecting-minion-slots.interaction';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';

export type SerializedMinionCard = SerializedCard & {
  potentialAttackTargets: string[];
  atk: number;
  maxHp: number;
  remainingHp: number;
  affinity: Affinity;
  manaCost: number;
  abilities: SerializedAbility[];
  position: Pick<MinionPosition, 'zone' | 'slot'> | null;
};
export type MinionCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, MinionCard>;
  canBlock: Interceptable<boolean, { attacker: Attacker }>;
  canBeBlocked: Interceptable<boolean, { blocker: Defender }>;
  canBeDefended: Interceptable<boolean, { defender: Defender }>;
  canAttack: Interceptable<boolean, { target: AttackTarget }>;
  canAttackOnSameTurnAsPlayed: Interceptable<boolean, MinionCard>;
  canBeAttacked: Interceptable<boolean, { target: AttackTarget }>;
  canUseAbility: Interceptable<boolean, MinionCard>;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, MinionCard>;
  atk: Interceptable<number, MinionCard>;
};
type MinionCardInterceptorName = keyof MinionCardInterceptors;

export const MINION_EVENTS = {
  MINION_SUMMONED: 'minion.summoned',
  MINION_BEFORE_TAKE_DAMAGE: 'minion.before-take-damage',
  MINION_AFTER_TAKE_DAMAGE: 'minion.after-take-damage',
  MINION_BEFORE_HEAL: 'minion.before-heal',
  MINION_AFTER_HEAL: 'minion.after-heal',
  MINION_BEFORE_USE_ABILITY: 'minion.before-use-ability',
  MINION_AFTER_USE_ABILITY: 'minion.after-use-ability'
} as const;
export type MinionEvents = Values<typeof MINION_EVENTS>;

export class MinionCardBeforeTakeDamageEvent extends TypedSerializableEvent<
  { card: MinionCard; damage: Damage },
  { card: SerializedMinionCard; damage: { type: DamageType; amount: number } }
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

export class MinionCardAfterTakeDamageEvent extends TypedSerializableEvent<
  { card: MinionCard; damage: Damage; isFatal: boolean },
  {
    card: SerializedMinionCard;
    damage: { type: DamageType; amount: number };
    isFatal: boolean;
  }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      },
      isFatal: this.data.isFatal
    };
  }
}

export class MinionCardHealEvent extends TypedSerializableEvent<
  { card: MinionCard; amount: number },
  { card: SerializedMinionCard; amount: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      amount: this.data.amount
    };
  }
}

export class MinionUsedAbilityEvent extends TypedSerializableEvent<
  { card: MinionCard; abilityId: string },
  { card: SerializedMinionCard; abilityId: string }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      abilityId: this.data.abilityId
    };
  }
}

export class MinionSummonedEvent extends TypedSerializableEvent<
  { card: MinionCard; position: { zone: 'attack' | 'defense'; slot: number } },
  { card: SerializedMinionCard; position: { zone: 'attack' | 'defense'; slot: number } }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      position: this.data.position
    };
  }
}

export type MinionCardEventMap = {
  [MINION_EVENTS.MINION_BEFORE_TAKE_DAMAGE]: MinionCardBeforeTakeDamageEvent;
  [MINION_EVENTS.MINION_AFTER_TAKE_DAMAGE]: MinionCardBeforeTakeDamageEvent;
  [MINION_EVENTS.MINION_BEFORE_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_AFTER_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_SUMMONED]: MinionSummonedEvent;
  [MINION_EVENTS.MINION_BEFORE_HEAL]: MinionCardHealEvent;
  [MINION_EVENTS.MINION_AFTER_HEAL]: MinionCardHealEvent;
};

export class MinionCard extends Card<
  SerializedCard,
  MinionCardInterceptors,
  MinionBlueprint
> {
  private damageTaken = 0;

  constructor(game: Game, player: Player, options: CardOptions<MinionBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canBlock: new Interceptable(),
        canBeBlocked: new Interceptable(),
        canBeDefended: new Interceptable(),
        canAttack: new Interceptable(),
        canAttackOnSameTurnAsPlayed: new Interceptable(),
        canBeAttacked: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable()
      },
      options
    );
  }

  get position() {
    return this.player.boardSide.getPositionFor(this);
  }

  get atk(): number {
    return this.interceptors.atk.getValue(this.blueprint.atk, this);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  get remainingHp(): number {
    return Math.max(this.maxHp - this.damageTaken, 0);
  }

  get canAttackOnSameTurnAsPlayed(): boolean {
    return this.interceptors.canAttackOnSameTurnAsPlayed.getValue(
      this.position?.zone === 'attack' && !this._isExhausted,
      this
    );
  }

  get slot() {
    if (!this.position) return null;
    return this.player.boardSide.getSlot(this.position.zone, this.position.slot);
  }

  protected async onInterceptorAdded(key: MinionCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp();
    }
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  canAttack(target: AttackTarget) {
    const base =
      this.position?.zone === 'attack' &&
      !this._isExhausted &&
      this.atk > 0 &&
      (this.game.gamePhaseSystem.elapsedTurns === this.playedAtTurn
        ? this.canAttackOnSameTurnAsPlayed
        : true);

    return this.interceptors.canAttack.getValue(base, {
      target
    });
  }

  canBeAttacked(target: AttackTarget) {
    return this.interceptors.canBeAttacked.getValue(true, {
      target
    });
  }

  canBlock(attacker: Attacker) {
    return this.interceptors.canBlock.getValue(
      this.position?.zone === 'defense' && !this._isExhausted,
      {
        attacker
      }
    );
  }

  canBeBlocked(blocker: Defender) {
    return this.interceptors.canBeBlocked.getValue(true, {
      blocker
    });
  }

  canBeDefendedBy(defender: Defender) {
    return this.interceptors.canBeDefended.getValue(true, {
      defender
    });
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
      this
    );
  }

  async useAbility(id: string) {
    const ability = this.blueprint.abilities.find(ability => ability.id === id);
    if (!ability) return;

    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_USE_ABILITY,
      new MinionUsedAbilityEvent({ card: this, abilityId: id })
    );
    const targets = await ability.getPreResponseTargets(this.game, this);
    if (ability.shouldExhaust) {
      await this.exhaust();
    }

    const effect = {
      source: this,
      handler: async () => {
        await ability.onResolve(this.game, this, targets);
        await this.game.emit(
          MINION_EVENTS.MINION_AFTER_USE_ABILITY,
          new MinionUsedAbilityEvent({ card: this, abilityId: id })
        );
      }
    };

    if (this.game.effectChainSystem.currentChain) {
      this.game.effectChainSystem.addEffect(effect, this.player);
    } else {
      void this.game.effectChainSystem.createChain(this.player, effect);
    }
  }

  getReceivedDamage(damage: Damage) {
    return this.interceptors.receivedDamage.getValue(damage.baseAmount, {
      damage
    });
  }

  private async checkHp() {
    if (this.remainingHp <= 0) {
      await this.destroy();
    }
  }

  async takeDamage(source: AnyCard, damage: Damage) {
    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_TAKE_DAMAGE,
      new MinionCardBeforeTakeDamageEvent({ card: this, damage })
    );
    this.damageTaken = Math.min(
      this.damageTaken + damage.getFinalAmount(this),
      this.maxHp
    );
    await this.game.emit(
      MINION_EVENTS.MINION_AFTER_TAKE_DAMAGE,
      new MinionCardAfterTakeDamageEvent({
        card: this,
        damage,
        isFatal: this.remainingHp <= 0
      })
    );
    await this.checkHp();
  }

  async heal(heal: number) {
    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_HEAL,
      new MinionCardHealEvent({ card: this, amount: heal })
    );
    this.damageTaken = Math.max(this.damageTaken - heal, 0);
    await this.game.emit(
      MINION_EVENTS.MINION_AFTER_HEAL,
      new MinionCardHealEvent({ card: this, amount: heal })
    );
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        !this.game.effectChainSystem.currentChain &&
        this.player.boardSide.hasUnoccupiedSlot &&
        this.location === 'hand' &&
        this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN &&
        (this.hasAffinityMatch ? this.blueprint.canPlay(this.game, this) : true),
      this
    );
  }

  async play() {
    if (!this.hasAffinityMatch) {
      return this.playWithoutAffinityMatch();
    }
    const [position] = await this.game.interaction.selectMinionSlot({
      player: this.player,
      isElligible(position) {
        return (
          position.player.equals(this.player) &&
          !this.player.boardSide.isOccupied(position.zone, position.slot)
        );
      },
      canCommit(selectedSlots) {
        return selectedSlots.length === 1;
      },
      isDone(selectedSlots) {
        return selectedSlots.length === 1;
      }
    });
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.updatePlayedAt();

    this.removeFromCurrentLocation();
    this.player.boardSide.summonMinion(this, position.zone, position.slot);
    await this.blueprint.onPlay(this.game, this);
    await this.game.emit(
      MINION_EVENTS.MINION_SUMMONED,
      new MinionSummonedEvent({ card: this, position })
    );

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  get potentialAttackTargets() {
    if (this.location !== 'board') return [];
    console.log(this.id, this.player.opponent.boardSide.getAllAttackTargets());
    return this.player.opponent.boardSide
      .getAllAttackTargets()
      .filter(target => this.canAttack(target));
  }

  serialize(): SerializedMinionCard {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      potentialAttackTargets: this.potentialAttackTargets.map(target => target.id),
      atk: this.atk,
      maxHp: this.maxHp,
      remainingHp: this.remainingHp,
      affinity: this.blueprint.affinity,
      position: this.position
        ? { zone: this.position.zone, slot: this.position.slot }
        : null,
      abilities: this.blueprint.abilities.map(ability => ({
        id: ability.id,
        canUse: this.canUseAbility(ability.id),
        name: ability.label,
        description: ability.description
      }))
    };
  }
}
