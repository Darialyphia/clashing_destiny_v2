import type { SerializedArtifactCard } from '../../card/entities/artifact-card.entity';
import type { SerializedCard } from '../../card/entities/card.entity';
import type { PatchOperation } from '../../game/systems/patch-types';
import { applyPatchToData } from '../utils/apply-patch';
import type { SerializedSpellCard } from '../../card/entities/spell-card.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { PlayerViewModel } from './player.model';
import type { ModifierViewModel } from './modifier.model';
import type { GameClientState } from '../controllers/state-controller';
import { PlayCardAction } from '../actions/play-card';
import type { CardKind } from '../../card/card.enums';
import type { SerializedMinionCard } from '../../card/entities/minion-card.entity';
import { GAME_PHASES } from '../../game/game.enums';
import type { AbilityViewModel } from './ability.model';

type CardData = SerializedSpellCard | SerializedArtifactCard | SerializedMinionCard;

export type CardActionRule = {
  id: string;
  predicate: (card: CardViewModel, state: GameClientState) => boolean;
  getLabel: (card: CardViewModel) => string;
  handler: (card: CardViewModel) => void;
};

export class CardViewModel {
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
    Object.assign(this.data, data);

    return this;
  }

  applyPatch(patch: PatchOperation) {
    applyPatchToData(this.data, patch);
    return this;
  }

  clone() {
    return new CardViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get isFoil() {
    return this.data.isFoil;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get spriteId() {
    return this.data.spriteId;
  }

  get kind() {
    return this.data.kind;
  }

  get rarity() {
    return this.data.rarity;
  }

  get keywords() {
    return this.data.keywords;
  }

  get sounds() {
    return this.data.sounds;
  }

  get player() {
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }

  get manaCost() {
    if ('manaCost' in this.data) {
      return this.data.manaCost as number;
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
    return this.data.jobs;
  }

  get location() {
    return this.data.location;
  }

  get atk() {
    if ('atk' in this.data) {
      return this.data.atk as number;
    }

    return null;
  }

  get baseAtk() {
    if ('baseAtk' in this.data) {
      return this.data.baseAtk as number;
    }
    return null;
  }

  get retaliation() {
    if ('retaliation' in this.data) {
      return this.data.retaliation as number;
    }

    return null;
  }

  get baseRetaliation() {
    if ('baseRetaliation' in this.data) {
      return this.data.baseRetaliation as number;
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

  get baseCmd() {
    if ('baseCmd' in this.data) {
      return this.data.baseCmd as number;
    }
    return null;
  }

  get cmd() {
    if ('cmd' in this.data) {
      return this.data.cmd as number;
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

  get unplayableReason() {
    if ('unplayableReason' in this.data) {
      return this.data.unplayableReason as string | null;
    }

    return null;
  }

  get indexInHand() {
    if (this.data.location !== 'hand') {
      return null;
    }

    return this.getPlayer().hand.findIndex(card => card.equals(this));
  }

  get isSelected() {
    return this.getClient().ui.selectedCard?.equals(this) ?? false;
  }

  get spacesToHighlight() {
    return this.data.spacesToHighlight;
  }

  get modifiers() {
    return this.data.modifiers.map(
      modId => this.getEntities()[modId] as ModifierViewModel
    );
  }

  get canReplace() {
    return this.data.canReplace;
  }

  get abilities() {
    if ('abilities' in this.data) {
      return (this.data.abilities as string[]).map(
        abilityId => this.getEntities()[abilityId] as AbilityViewModel
      );
    }
    return [];
  }

  getPlayer() {
    return this.getEntities()[this.data.player] as PlayerViewModel;
  }

  play() {
    const player = this.getPlayer();

    const index = player.hand.findIndex(card => card.equals(this));
    if (index === -1) return;

    player.playCard(index);
  }

  cancelPlay() {
    const state = this.getClient().state;
    if (state.phase.state !== GAME_PHASES.PLAYING_CARD) return;
    if (state.phase.ctx.card !== this.id) return;
    if (!state.phase.ctx.canCancel) return;
    this.getClient().cancelPlayCard();
  }

  getActions(): CardActionRule[] {
    return [new PlayCardAction(this.getClient())].filter(rule => rule.predicate(this));
  }
}
