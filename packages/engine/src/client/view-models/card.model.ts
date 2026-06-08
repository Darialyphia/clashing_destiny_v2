import type { SerializedCard } from '../../card/entities/card.entity';
import type { SerializedHeroCard } from '../../card/entities/hero.entity';
import type { SerializedMinionCard } from '../../card/entities/minion.entity';
import type { SerializedSpellCard } from '../../card/entities/spell.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { SerializedTargets } from '../../card/card-blueprint';
import type { PlayerViewModel } from './player.model';
import type { ModifierViewModel } from './modifier.model';
import type { GameClientState } from '../controllers/state-controller';
import {
  CARD_KINDS,
  type Affinity,
  type CardKind,
  type CardSpeed,
  type JobId
} from '../../card/card.enums';
import { UseAbilityAction } from '../actions/use-ability';
import { INTERACTION_STATES, COMBAT_STEPS } from '../../game/game.enums';
import { AbilityViewModel } from './ability.model';
import { PatchApplier } from '../patch-applier';
import type { PatchOperation } from '../../game/systems/patch-types';
import type { BoardSpaceViewModel } from './board-space.model';
import type { SerializedTrapCard } from '../../card/entities/trap.entity';

type CardData =
  | SerializedSpellCard
  | SerializedHeroCard
  | SerializedMinionCard
  | SerializedTrapCard;

export type CardActionRule = {
  id: string;
  predicate: (card: CardViewModel, state: GameClientState) => boolean;
  getLabel: (card: CardViewModel) => string;
  handler: (card: CardViewModel) => void;
};

export class CardViewModel {
  private static patchApplier = new PatchApplier();
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedCard,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: CardViewModel | SerializedCard) {
    return this.id === unit.id;
  }

  update<T extends CardKind>(data: Partial<CardData & { kind: T }>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  /**
   * Update using patch operations for granular changes
   */
  updateWithPatches(patches: PatchOperation[]) {
    this.data = CardViewModel.patchApplier.applyPatches(this.data, patches);
    return this;
  }

  clone() {
    return new CardViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get art() {
    return {
      isFullArt: this.data.art.isFullArt,
      dimensions: 'dimensions' in this.data.art ? this.data.art.dimensions : undefined,
      foil: this.data.art.foil,
      main: `cards/${this.data.art.main}`,
      bg: `cards/${this.data.art.bg}`,
      foilBg: this.data.art.foilBg ? `cards/${this.data.art.foilBg}` : undefined,
      foilMain: this.data.art.foilMain ? `cards/${this.data.art.foilMain}` : undefined
    };
  }

  get isSelected() {
    return this.getClient().ui.selectedCard?.equals(this) ?? false;
  }

  get isRevealed() {
    return this.data.isRevealed;
  }

  get isFoil() {
    return false;
  }

  get kind() {
    return this.data.kind;
  }

  get rarity() {
    return this.data.rarity;
  }

  get keywords() {
    return (this.data.keywords ?? []) as string[];
  }

  get countdown() {
    if ('countdown' in this.data) {
      return this.data.countdown as number;
    }

    return null;
  }

  get maxCountdown() {
    if ('maxCountdown' in this.data) {
      return this.data.maxCountdown as number;
    }

    return null;
  }

  get hasSummoningSickness() {
    if ('hasSummoningSickness' in this.data) {
      return this.data.hasSummoningSickness as boolean;
    }

    return false;
  }

  get manaCost() {
    if ('manaCost' in this.data) {
      return this.data.manaCost as number;
    }
    return null;
  }

  get expCost() {
    if ('expCost' in this.data) {
      return this.data.expCost as number;
    }
    return null;
  }

  get baseManaCost() {
    if ('baseManaCost' in this.data) {
      return this.data.baseManaCost as number;
    }
    return null;
  }

  get jobs() {
    if ('jobs' in this.data) {
      return this.data.jobs as JobId[];
    }
    return [];
  }

  get affinities() {
    return this.data.affinities as Affinity[];
  }

  get speed() {
    if ('speed' in this.data) {
      return this.data.speed as CardSpeed;
    }
    return null;
  }
  get advancedAffinity() {
    if ('advancedAffinity' in this.data) {
      return this.data.advancedAffinity as Affinity | null;
    }
    return null;
  }

  get subKind() {
    if ('subKind' in this.data) {
      return this.data.subKind as string;
    }
    return null;
  }

  get unplayableReason() {
    return this.data.unplayableReason;
  }

  get location() {
    return this.data.location;
  }

  get atk() {
    if ('atk' in this.data) {
      return this.data.atk as number;
    }

    if ('atkBonus' in this.data) {
      return this.data.atkBonus as number | null;
    }

    return null;
  }

  get baseAtk() {
    if ('baseAtk' in this.data) {
      return this.data.baseAtk as number;
    }
    return null;
  }

  get maxHp() {
    if ('maxHp' in this.data) {
      return this.data.maxHp as number;
    }

    return null;
  }

  get baseMaxHp() {
    if ('baseMaxHp' in this.data) {
      return this.data.baseMaxHp as number;
    }

    return null;
  }

  get hp() {
    if ('remainingHp' in this.data) {
      return this.data.remainingHp as number;
    }

    return null;
  }

  get level() {
    if ('level' in this.data) {
      return this.data.level as number;
    }
    if ('minLevel' in this.data) {
      return this.data.minLevel as number;
    }

    return null;
  }

  get spellpower() {
    if ('spellPower' in this.data) {
      return this.data.spellPower as number;
    }

    return null;
  }

  get baseSpellpower() {
    if ('baseSpellPower' in this.data) {
      return this.data.baseSpellPower as number;
    }
    return null;
  }

  get durability() {
    if ('durability' in this.data) {
      return this.data.durability as number;
    }

    return null;
  }

  get canPlay() {
    return this.data.canPlay;
  }

  get potentialAttackTargets() {
    if ('potentialAttackTargets' in this.data) {
      return (
        this.data.potentialAttackTargets as SerializedMinionCard['potentialAttackTargets']
      ).map(targetId => {
        return this.getEntities()[targetId] as CardViewModel;
      });
    }

    return [];
  }

  get potentialMoveTargets() {
    if ('potentialMoveTargets' in this.data) {
      return (
        this.data.potentialMoveTargets as SerializedMinionCard['potentialMoveTargets']
      ).map(spaceId => {
        return this.getEntities()[spaceId] as BoardSpaceViewModel;
      });
    }

    return [];
  }

  get canAttack() {
    return (
      this.player.id === this.getClient().state.currentPlayer &&
      this.potentialAttackTargets.length > 0
    );
  }

  canAttackAt(space: BoardSpaceViewModel) {
    if (!this.canAttack) return false;
    return this.potentialAttackTargets.some(target => target.id === space.id);
  }

  canMoveTo(space: BoardSpaceViewModel) {
    if (!this.canMove) return false;

    return this.potentialMoveTargets.some(target => target.id === space.id);
  }

  get canBlock() {
    if ('canBlock' in this.data) {
      return this.data.canBlock as boolean;
    }
    return false;
  }

  get canRetaliate() {
    if ('canRetaliate' in this.data) {
      return this.data.canRetaliate as boolean;
    }
    return false;
  }

  get canBeTargeted() {
    const client = this.getClient();
    const state = client.stateManager.state;
    const canSelect =
      state.interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
      state.interaction.ctx.elligibleCards.some(id => id === this.id) &&
      client.getActivePlayerId() === client.playerId;

    const canAttack =
      state.interaction.state === INTERACTION_STATES.IDLE &&
      state.combat.step === COMBAT_STEPS.DECLARE_TARGET &&
      state.combat.potentialTargets.some(id => id === this.id) &&
      client.getActivePlayerId() === client.playerId;

    return canSelect || canAttack;
  }

  get isExhausted() {
    return this.data.isExhausted;
  }

  get indexInHand() {
    if (this.data.location !== 'hand') {
      return null;
    }

    return this.player.hand.findIndex(card => card.id === this.id);
  }

  get preResponseTargets() {
    if ('preResponseTargets' in this.data) {
      return this.data.preResponseTargets as SerializedTargets[];
    }

    return null;
  }

  get isAttacking() {
    const relevantKinds: CardKind[] = [CARD_KINDS.MINION];
    if (!relevantKinds.includes(this.kind)) {
      return false;
    }
    const state = this.getClient().state;

    return state.combat.attacker === this.id;
  }

  get canMove() {
    if ('canMove' in this.data) {
      return this.data.canMove as boolean;
    }

    return false;
  }

  get player() {
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }

  get modifiers() {
    return this.data.modifiers.map(modifierId => {
      return this.getEntities()[modifierId] as ModifierViewModel;
    });
  }

  play() {
    const hand = this.player.hand;

    const index = hand.findIndex(card => card.id === this.id);
    if (index === -1) return;

    this.getClient().declarePlayCard(this);
  }

  get actions(): CardActionRule[] {
    const actions = this.abilityActions.filter(rule => rule.predicate());

    return actions;
  }

  getCurrentAction() {
    const state = this.getClient().state;
    return this.actions.find(action => action.predicate(this, state)) ?? null;
  }

  get abilities() {
    if ('abilities' in this.data) {
      return (this.data.abilities as string[]).map(ability => {
        return this.getEntities()[ability] as AbilityViewModel;
      });
    }

    return [];
  }

  get abilityActions() {
    return this.abilities.map(ability => new UseAbilityAction(this.getClient(), ability));
  }

  get hasAction() {
    return this.canMove || this.canAttack || this.actions.length > 0;
  }
}
