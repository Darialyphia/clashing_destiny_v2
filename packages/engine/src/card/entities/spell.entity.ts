import type { Game } from '../../game/game';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import {
  serializePreResponseTarget,
  type AbilityBlueprint,
  type PreResponseTarget,
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
import { CARD_EVENTS, type JobId, type RuneId } from '../card.enums';
import { CardDeclarePlayEvent } from '../card.events';
import { Ability } from './ability.entity';
import { GAME_PHASES } from '../../game/game.enums';

export type SerializedSpellCard = SerializedCard & {
  manaCost: number;
  baseManaCost: number;
  preResponseTargets: SerializedPreResponseTarget[] | null;
  abilities: string[];
  jobs: JobId[];
  runeCost: Partial<Record<RuneId, number>>;
};
export type SpellCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SpellCard>;
  canPlayDuringCombatPhase: Interceptable<boolean, SpellCard>;
  canUseAbility: Interceptable<boolean, { card: SpellCard; ability: Ability<SpellCard> }>;
  canBeTargeted: Interceptable<boolean, SpellCard>;
};

export class SpellCard extends Card<
  SerializedCard,
  SpellCardInterceptors,
  SpellBlueprint
> {
  private preResponseTargets: PreResponseTarget[] | null = null;

  readonly abilityTargets = new Map<string, PreResponseTarget[]>();

  readonly abilities: Ability<SpellCard>[] = [];

  constructor(game: Game, player: Player, options: CardOptions<SpellBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canPlayDuringCombatPhase: new Interceptable(),
        canBeTargeted: new Interceptable(),
        canUseAbility: new Interceptable()
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

  addAbility(ability: AbilityBlueprint<SpellCard, PreResponseTarget>) {
    const newAbility = new Ability<SpellCard>(this.game, this, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.abilityId === abilityId);
    if (index === -1) return;
    this.abilities.splice(index, 1);
  }

  get canPlayDuringCombatPhase(): boolean {
    return this.interceptors.canPlayDuringCombatPhase.getValue(false, this);
  }

  get isCorrectPhaseToPlay() {
    const validPhases: string[] = this.canPlayDuringCombatPhase
      ? [GAME_PHASES.MAIN, GAME_PHASES.COMBAT]
      : [GAME_PHASES.MAIN];
    return validPhases.includes(this.game.gamePhaseSystem.getContext().state);
  }

  get hasCorrectRunes() {
    return this.player.runeManager.satisfiesRuneCost(this.blueprint.runeCost);
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase &&
        this.hasCorrectRunes &&
        this.blueprint.canPlay(this.game, this) &&
        this.isCorrectPhaseToPlay,
      this
    );
  }

  async playWithTargets(targets: PreResponseTarget[]) {
    this.preResponseTargets = targets;

    await this.blueprint.onPlay(this.game, this, this.preResponseTargets!);

    await this.dispose();

    this.preResponseTargets?.forEach(target => {
      if (target instanceof Card) {
        target.clearTargetedBy({ type: 'card', card: this });
      }
    });
    this.preResponseTargets = null;
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );
    const targets = await this.blueprint.getPreResponseTargets(this.game, this);
    await this.playWithTargets(targets);
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
      runeCost: this.blueprint.runeCost
    };
  }
}
