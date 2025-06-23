import type { Game } from '../game/game';
import type { HeroCard } from './entities/hero.entity';
import type {
  TalentTreeBlueprint,
  TalentTreeNodeBlueprint as TalentTreeNodeBlueprint
} from './card-blueprint';
import { isDefined, type Serializable } from '@game/shared';
import { GameError } from '../game/game-error';

type SerializedTalentTreeNode = {
  id: string;
  isUnlocked: boolean;
  iconId: string;
  name: string;
  description: string;
  level: number;
  parentIds: string[];
};

type SerializedTalentTree = {
  heroId: string;
  nodes: SerializedTalentTreeNode[];
};

export class TalentTreeNode implements Serializable<SerializedTalentTreeNode> {
  readonly blueprint: TalentTreeNodeBlueprint;

  private _isUnlocked = false;

  private tree: TalentTree;

  constructor(
    private game: Game,
    blueprint: TalentTreeNodeBlueprint,
    tree: TalentTree
  ) {
    this.blueprint = blueprint;
    this.tree = tree;
  }

  get id() {
    return this.blueprint.id;
  }

  get isUnlocked() {
    return this._isUnlocked;
  }

  get parents() {
    return this.blueprint.parentIds.map(pid => this.tree.getNode(pid)).filter(isDefined);
  }

  get canUnlock(): boolean {
    return !this.isUnlocked && this.parents.every(parent => parent.isUnlocked);
  }

  async unlock(): Promise<void> {
    if (!this.canUnlock) throw new GameError('Cannot unlock this node.');
    await this.blueprint.onResolve(this.game, this.tree.hero);
    this._isUnlocked = true;
  }

  serialize(): SerializedTalentTreeNode {
    return {
      id: this.id,
      isUnlocked: this.isUnlocked,
      iconId: this.blueprint.iconId,
      name: this.blueprint.name,
      description: this.blueprint.description,
      level: this.blueprint.level,
      parentIds: this.blueprint.parentIds
    };
  }
}

export class TalentTree implements Serializable<SerializedTalentTree> {
  private nodeMap: Map<string, TalentTreeNode>;

  constructor(
    private readonly game: Game,
    blueprint: TalentTreeBlueprint,
    readonly hero: HeroCard
  ) {
    this.nodeMap = new Map();
    for (const node of blueprint.nodes) {
      this.nodeMap.set(node.id, new TalentTreeNode(game, node, this));
    }
  }

  getNode(id: string): TalentTreeNode | undefined {
    return this.nodeMap.get(id);
  }

  get nodes() {
    return Array.from(this.nodeMap.values());
  }

  get unlockableNodes() {
    return this.nodes.filter(node => node.canUnlock);
  }

  serialize(): SerializedTalentTree {
    return {
      heroId: this.hero.id,
      nodes: this.nodes.map(node => node.serialize())
    };
  }
}
