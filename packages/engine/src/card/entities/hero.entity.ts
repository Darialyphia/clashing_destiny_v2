import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import { type AbilityBlueprint, type HeroBlueprint } from '../card-blueprint';
import { type JobId } from '../card.enums';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { GAME_PHASES } from '../../game/game.enums';
import { Ability } from './ability.entity';
import type { MinionCard } from './minion.entity';
import { HERO_EVENTS, HeroPlayedEvent } from '../events/hero.events';
import { AbilityManagerComponent } from '../components/abilities-manager.component';

export type SerializedHeroCard = SerializedCard & {
  spellPower: number;
  baseSpellPower: number;
  abilities: string[];
  jobs: JobId[];
};

export type HeroCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, HeroCard>;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  canUseAbility: Interceptable<boolean, { card: HeroCard; ability: Ability<HeroCard> }>;
  spellPower: Interceptable<number, HeroCard>;
};

export type HeroCardInterceptorName = keyof HeroCardInterceptors;

export class HeroCard extends Card<SerializedCard, HeroCardInterceptors, HeroBlueprint> {
  private damageTaken = 0;

  readonly abilityManager: AbilityManagerComponent<HeroCard>;

  constructor(game: Game, player: Player, options: CardOptions<HeroBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        spellPower: new Interceptable()
      },
      options
    );

    this.abilityManager = new AbilityManagerComponent<HeroCard>(game, this);
  }

  isValidMovementPosition() {
    return false;
  }

  get spellPower(): number {
    return this.interceptors.spellPower.getValue(0, this);
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  canUseAbility(id: string) {
    const ability = this.abilityManager.getAbility(id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(
      this.abilityManager.canUseAbility(id),
      {
        card: this,
        ability
      }
    );
  }

  addAbility(ability: AbilityBlueprint<HeroCard, any>) {
    return this.abilityManager.addAbility(ability);
  }

  removeAbility(abilityId: string) {
    this.abilityManager.removeAbility(abilityId);
  }

  get isAttackTarget() {
    return this.game.combatSystem.defender?.equals(this);
  }

  get canResolveCombat() {
    return this.isAttackTarget;
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  get isCorrectPhaseToPlay() {
    return this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN;
  }

  canPlay() {
    return true;
  }

  get unplayableReason() {
    const base = super.unplayableReason;
    if (base !== 'You cannot play this card.') return base;

    return base;
  }

  async play() {
    await this.blueprint.onPlay(this.game, this, this);
    await this.game.emit(HERO_EVENTS.HERO_PLAYED, new HeroPlayedEvent({ card: this }));

    return { cancelled: false };
  }

  get potentialAttackTargets(): Array<MinionCard | HeroCard> {
    return []; // pending refactor making heroes unable to attack
  }

  serialize(): SerializedHeroCard {
    return {
      ...this.serializeBase(),
      spellPower: this.spellPower,
      baseSpellPower: this.spellPower,
      abilities: this.abilityManager.serialize(),
      jobs: this.jobs.map(job => job.id) as JobId[]
    };
  }
}
