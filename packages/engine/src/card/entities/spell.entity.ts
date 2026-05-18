import type { Game } from '../../game/game';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import {
  serializePreResponseTarget,
  type AbilityBlueprint,
  type Target,
  type SerializedPreResponseTarget,
  type SpellBlueprint
} from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { CARD_EVENTS, type CardSpeed, type JobId } from '../card.enums';
import { CardBeforePlayEvent, CardPlayEvent } from '../card.events';
import { Ability } from './ability.entity';
import { GAME_PHASES } from '../../game/game.enums';

export type SerializedSpellCard = SerializedCard & {
  manaCost: number;
  baseManaCost: number;
  preResponseTargets: SerializedPreResponseTarget[] | null;
  abilities: string[];
  jobs: JobId[];
  speed: CardSpeed;
};
export type SpellCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SpellCard>;
  canUseAbility: Interceptable<boolean, { card: SpellCard; ability: Ability<SpellCard> }>;
  canBeTargeted: Interceptable<boolean, SpellCard>;
  speed: Interceptable<CardSpeed, SpellCard>;
};

export class SpellCard extends Card<
  SerializedCard,
  SpellCardInterceptors,
  SpellBlueprint
> {
  private preResponseTargets: Target[] | null = null;

  readonly abilityTargets = new Map<string, Target[]>();

  readonly abilities: Ability<SpellCard>[] = [];

  constructor(game: Game, player: Player, options: CardOptions<SpellBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canBeTargeted: new Interceptable(),
        canUseAbility: new Interceptable(),
        speed: new Interceptable()
      },
      options
    );

    this.blueprint.abilities.forEach(ability => {
      this.abilities.push(new Ability<SpellCard>(this.game, this, ability));
    });
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  get speed(): CardSpeed {
    return this.interceptors.speed.getValue(this.blueprint.speed, this);
  }

  isValidMovementPosition() {
    return false;
  }

  get canBeTargeted(): boolean {
    return this.interceptors.canBeTargeted.getValue(true, this);
  }

  replaceAbilityTarget(abilityId: string, oldTarget: AnyCard, newTarget: AnyCard) {
    const targets = this.abilityTargets.get(abilityId);
    if (!targets) return;
    if (newTarget instanceof Card) {
      const index = targets.findIndex(t => t instanceof Card && t.equals(oldTarget));
      if (index === -1) return;

      const oldTarget = targets[index] as AnyCard;
      oldTarget.clearTargetedBy({ type: 'ability', abilityId, card: this });

      targets[index] = newTarget;
      newTarget.targetBy({ type: 'ability', abilityId, card: this });
    }
  }

  replacePreResponseTarget(oldTarget: AnyCard, newTarget: AnyCard) {
    if (!this.preResponseTargets) return;
    if (newTarget instanceof Card) {
      const index = this.preResponseTargets.findIndex(
        t => t instanceof Card && t.equals(oldTarget)
      );
      if (index === -1) return;

      oldTarget.clearTargetedBy({ type: 'card', card: this });

      this.preResponseTargets[index] = newTarget;
      newTarget.targetBy({ type: 'card', card: this });
    }
  }

  canUseAbility(id: string) {
    const ability = this.abilities.find(ability => ability.abilityId === id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(ability.canUse, {
      card: this,
      ability
    });
  }

  addAbility(ability: AbilityBlueprint<SpellCard, Target>) {
    const newAbility = new Ability<SpellCard>(this.game, this, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.abilityId === abilityId);
    if (index === -1) return;
    this.abilities.splice(index, 1);
  }

  get isCorrectPhaseToPlay() {
    return this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN;
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        this.hasUnlockedAffinity &&
        this.blueprint.canPlay(this.game, this) &&
        this.isCorrectPhaseToPlay,
      this
    );
  }

  async playWithTargets(targets: Target[]) {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.preResponseTargets = targets;

    await this.blueprint.onPlay(this.game, this, this.preResponseTargets!);

    await this.dispose();

    this.preResponseTargets?.forEach(target => {
      if (target instanceof Card) {
        target.clearTargetedBy({ type: 'card', card: this });
      }
    });
    this.preResponseTargets = null;

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardPlayEvent({ card: this })
    );
    const targetsResult = await this.blueprint.getTargets(this.game, this);
    if (targetsResult.cancelled) {
      return { cancelled: true };
    }
    await this.playWithTargets(targetsResult.result);
    return { cancelled: false };
  }

  serialize(): SerializedSpellCard {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      baseManaCost: this.manaCost,
      abilities: this.abilities.map(ability => ability.id),
      preResponseTargets: this.preResponseTargets
        ? this.preResponseTargets.map(serializePreResponseTarget)
        : null,
      jobs: this.jobs.map(job => job.id) as JobId[],
      speed: this.speed
    };
  }
}
