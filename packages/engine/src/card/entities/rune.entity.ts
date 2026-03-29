import type { Game } from '../../game/game';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import {
  type AbilityBlueprint,
  type PreResponseTarget,
  type RuneBlueprint
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

export type SerializedRuneCard = SerializedCard & {
  runeProduction: RuneId[];
  jobs: JobId[];
  abilities: string[];
};
export type RuneCardInterceptors = CardInterceptors & {
  canUseAbility: Interceptable<boolean, { card: RuneCard; ability: Ability<RuneCard> }>;
  runeProduction: Interceptable<RuneId[], RuneCard>;
};

export class RuneCard extends Card<
  SerializedRuneCard,
  RuneCardInterceptors,
  RuneBlueprint
> {
  private preResponseTargets: PreResponseTarget[] | null = null;

  readonly abilityTargets = new Map<string, PreResponseTarget[]>();

  readonly abilities: Ability<RuneCard>[] = [];

  constructor(game: Game, player: Player, options: CardOptions<RuneBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canUseAbility: new Interceptable(),
        runeProduction: new Interceptable()
      },
      options
    );

    this.blueprint.abilities.forEach(ability => {
      this.abilities.push(new Ability<RuneCard>(this.game, this, ability));
    });
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

  addAbility(ability: AbilityBlueprint<RuneCard, PreResponseTarget>) {
    const newAbility = new Ability<RuneCard>(this.game, this, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.abilityId === abilityId);
    if (index === -1) return;
    this.abilities.splice(index, 1);
  }

  canPlay() {
    return true;
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );

    await this.sendToRuneZone();
    await this.blueprint.onPlay(this.game, this);
  }

  get runeProduction(): RuneId[] {
    return this.interceptors.runeProduction.getValue(this.blueprint.runeProduction, this);
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  get isBasic() {
    return this.blueprint.isBasic;
  }

  serialize(): SerializedRuneCard {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      abilities: this.abilities.map(ability => ability.id),
      jobs: this.jobs.map(job => job.id) as JobId[],
      runeProduction: this.runeProduction
    };
  }
}
