import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedLocationCard } from '../../card/entities/location.entity';
import type { SerializedArtifactCard } from '../../card/entities/artifact.entity';
import type { SerializedCard } from '../../card/entities/card.entity';
import type { SerializedHeroCard } from '../../card/entities/hero.entity';
import type { SerializedMinionCard } from '../../card/entities/minion.card';
import type { SerializedSpellCard } from '../../card/entities/spell.entity';
import type { GameStateEntities } from '../client';
import type { SerializedTalentCard } from '../../card/entities/talent.entity';
import type { SerializedAttackCard } from '../../card/entities/attck.entity';
import type { SerializedAbility } from '../../card/card-blueprint';
import type { PlayerViewModel } from './player.model';
import type { ModifierViewModel } from './modifier.model';

type CardData =
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedHeroCard
  | SerializedMinionCard
  | SerializedLocationCard
  | SerializedTalentCard
  | SerializedAttackCard;

export class CardViewModel {
  private getEntities: () => GameStateEntities;

  constructor(
    private data: SerializedCard,
    entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {
    this.getEntities = () => entityDictionary;
  }

  equals(unit: CardViewModel | SerializedCard) {
    return this.id === unit.id;
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

  get imagePath() {
    return `/assets/icons/${this.data.cardIconId}.png`;
  }

  get kind() {
    return this.data.kind;
  }

  get rarity() {
    return this.data.rarity;
  }

  get manaCost() {
    if ('manaCost' in this.data) {
      return this.data.manaCost as number;
    }
    return null;
  }

  get destinyCost() {
    if ('destinyCost' in this.data) {
      return this.data.destinyCost as number;
    }

    return null;
  }

  get abilities() {
    if ('abilities' in this.data) {
      return this.data.abilities as SerializedAbility[];
    }

    return [];
  }

  get usableAbilities() {
    return this.abilities.filter(a => a.canUse);
  }

  get atk() {
    if ('atk' in this.data) {
      return this.data.atk as number;
    }

    return null;
  }

  get maxHp() {
    if ('maxHp' in this.data) {
      return this.data.maxHp as number;
    }

    return null;
  }

  get level() {
    if ('level' in this.data) {
      return this.data.level as number;
    }

    return null;
  }

  get spellpower() {
    if ('spellpower' in this.data) {
      return this.data.spellpower as number;
    }

    return null;
  }

  get durability() {
    if ('durability' in this.data) {
      return this.data.durability as number;
    }

    return null;
  }

  get affinity() {
    return this.data.affinity;
  }

  get canPlay() {
    return this.data.canPlay;
  }

  getPlayer() {
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }

  getModifiers() {
    return this.data.modifiers.map(modifierId => {
      return this.getEntities()[modifierId] as ModifierViewModel;
    });
  }

  play(manaCostIndices: number[]) {
    const player = this.getPlayer();
    const hand = player.getHand();

    const index = hand.findIndex(card => card.equals(this));
    if (index === -1) return;
    player.playCard(index, manaCostIndices);
  }
}
