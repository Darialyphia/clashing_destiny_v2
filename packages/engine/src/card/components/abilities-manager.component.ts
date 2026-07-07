import type { Game } from '../../game/game';
import type { AbilityBlueprint, Targets } from '../card-blueprint';
import { Ability, type AbilityOwner } from '../entities/ability.entity';

export class AbilityManagerComponent<T extends AbilityOwner> {
  readonly abilityTargets = new Map<string, Targets>();

  readonly abilities: Ability<T>[] = [];

  constructor(
    private game: Game,
    private card: T
  ) {
    this.card.blueprint.abilities.forEach(ability => {
      this.abilities.push(new Ability<T>(this.game, this.card, ability as any));
    });
  }

  getAbility(abilityId: string) {
    return this.abilities.find(ability => ability.abilityId === abilityId) ?? null;
  }

  canUseAbility(id: string) {
    const ability = this.abilities.find(ability => ability.abilityId === id);
    if (!ability) return false;

    return ability.canUse;
  }

  hasAbility(abilityId: string) {
    return this.abilities.some(ability => ability.abilityId === abilityId);
  }

  addAbility(ability: AbilityBlueprint<T, any>) {
    const newAbility = new Ability<T>(this.game, this.card, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.abilityId === abilityId);
    if (index === -1) return;
    this.abilities.splice(index, 1);
  }

  serialize() {
    return this.abilities.map(ability => ability.id);
  }
}
