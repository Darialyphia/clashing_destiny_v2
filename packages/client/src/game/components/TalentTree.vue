<script setup lang="ts">
import type { SerializedTalentTreeNode } from '@game/engine/src/card/talent-tree';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { useGameClient, useGameState } from '../composables/useGameClient';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import {
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardContent
} from 'reka-ui';

const { player } = defineProps<{ player: PlayerViewModel }>();

const talentTree = computed(() => player.talentTree);
const state = useGameState();
const client = useGameClient();
function assignLayers(nodes: SerializedTalentTreeNode[]): Map<string, number> {
  const layers = new Map<string, number>();

  for (const node of nodes) {
    layers.set(node.id, node.level);
  }
  return layers;
}

function orderNodes(
  layers: Map<string, number>,
  nodes: SerializedTalentTreeNode[]
) {
  const layerMap = new Map<number, SerializedTalentTreeNode[]>();
  for (const node of nodes) {
    const layer = layers.get(node.id)!;
    if (!layerMap.has(layer)) layerMap.set(layer, []);
    layerMap.get(layer)!.push(node);
  }

  const ordered = new Map<number, SerializedTalentTreeNode[]>();
  const nodeX = new Map<string, number>();

  const maxLayer = Math.max(...layerMap.keys());

  for (let l = 0; l <= maxLayer; l++) {
    const layerNodes = layerMap.get(l)!;

    layerNodes.sort((a, b) => {
      const aAvg = averageParentX(a.parentIds, nodeX);
      const bAvg = averageParentX(b.parentIds, nodeX);
      return aAvg - bAvg;
    });

    ordered.set(l, layerNodes);
    layerNodes.forEach((n, i) => nodeX.set(n.id, i));
  }

  return ordered;
}

function averageParentX(parents: string[], nodeX: Map<string, number>): number {
  if (parents.length === 0) return 0;
  const total = parents.map(p => nodeX.get(p) ?? 0).reduce((a, b) => a + b, 0);
  return total / parents.length;
}

type NodePosition = { node: SerializedTalentTreeNode; x: number; y: number };

const root = useTemplateRef('root');

const maxLevel = 6;

function computeNodePositions(
  ordered: Map<number, SerializedTalentTreeNode[]>
): NodePosition[] {
  const positions: NodePosition[] = [];
  const width = root.value?.clientWidth ?? 800;
  const height = root.value?.clientHeight ?? 600;
  const layerHeight = height / maxLevel;
  const nodeSpacing = width / 4;

  for (const [layer, nodes] of ordered.entries()) {
    nodes.forEach((node, i) => {
      positions.push({
        node,
        x: i * nodeSpacing + 25,
        y: height - layer * layerHeight - 30
      });
    });
  }

  return positions;
}

const layers = computed(() => assignLayers(talentTree.value.nodes));
const ordered = computed(() =>
  orderNodes(layers.value, talentTree.value.nodes)
);
const positions = computed(() => computeNodePositions(ordered.value));
const positionMap = computed(() =>
  Object.fromEntries(positions.value.map(p => [p.node.id, p]))
);
</script>

<template>
  <div class="talent-tree" ref="root">
    <svg>
      <template v-for="node in talentTree.nodes">
        <line
          v-for="parent in node.parentIds"
          :key="`${node.id}-${parent}`"
          :x1="positionMap[parent].x"
          :y1="positionMap[parent].y"
          :x2="positionMap[node.id].x"
          :y2="positionMap[node.id].y"
          class="arrow"
          :class="{ unlocked: node.isUnlocked }"
        />
      </template>

      <g
        v-for="position in positions"
        :key="position.node.id"
        class="node"
        :class="{
          unlocked: position.node.isUnlocked,
          disabled: !position.node.isUnlocked && !position.node.canUnlock,
          interactive:
            position.node.canUnlock &&
            state.phase.state === GAME_PHASES.DESTINY &&
            state.turnPlayer === player.id
        }"
      >
        <circle :cx="position.x" :cy="position.y" r="12" />
      </g>
    </svg>

    <HoverCardRoot
      v-for="position in positions"
      :key="position.node.id"
      :open-delay="0"
      :close-delay="0"
    >
      <HoverCardTrigger as-child>
        <div
          class="node-item"
          :style="{
            left: `${position.x}px`,
            top: `${position.y}px`,
            '--bg': `url(/assets/icons/${position.node.iconId}.png)`
          }"
          :class="{
            unlocked: position.node.isUnlocked,
            disabled: !position.node.isUnlocked && !position.node.canUnlock,
            interactive:
              position.node.canUnlock &&
              state.phase.state === GAME_PHASES.DESTINY &&
              state.turnPlayer === player.id
          }"
          @click="
            () => {
              if (
                position.node.canUnlock &&
                state.phase.state === GAME_PHASES.DESTINY &&
                state.turnPlayer === player.id
              ) {
                client.unlockTalent(position.node.id);
              }
            }
          "
        />
      </HoverCardTrigger>
      <HoverCardPortal to="#card-portal">
        <HoverCardContent :side-offset="30">
          <div class="node-infos">
            <div class="node-title">
              <div
                class="node-image"
                :style="{
                  '--bg': `url(/assets/icons/${position.node.iconId}.png)`
                }"
              />
              {{ position.node.name }}

              <div class="node-cost">{{ position.node.destinyCost }}</div>
            </div>
            {{ position.node.description }}
          </div>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCardRoot>
  </div>
</template>

<style scoped lang="postcss">
.talent-tree {
  --pixel-scale: 2;
  aspect-ratio: var(--hero-ratio);
  max-height: calc(var(--pixel-scale) * var(--hero-height));
  background-color: black;
  position: relative;
}

svg {
  border: 1px solid #ccc;
  height: 100%;
  width: 100%;
}

.node circle {
  fill: #0084e3;
  stroke: #333;
  stroke-width: 1px;

  .unlocked & {
    fill: cyan;
  }

  .disabled & {
    fill: #004ea6;
  }

  .interactive & {
    cursor: pointer;
    filter: drop-shadow(0 0 10px yellow);
  }
}
.arrow {
  stroke: #444;
  stroke-width: 2;
  fill: none;
  &.unlocked {
    stroke: cyan;
  }
}

.node-item {
  position: absolute;
  width: 32px;
  aspect-ratio: 1;
  background: var(--bg) no-repeat center;
  background-size: cover;
  transform: translate(-50%, -50%);
  filter: sepia(0.35) hue-rotate(-20deg) brightness(0.75);
  &.unlocked {
    filter: none;
  }
  &.disabled {
    filter: sepia(0.7) hue-rotate(-20deg) brightness(0.35);
  }
  &:not(.disabled):hover {
    filter: brightness(1.35);
    cursor: url('/assets/ui/cursor-hover.png'), auto;
  }
}

.node-infos {
  background-color: black;
  padding: var(--size-3);
  color: white;
  width: 40ch;
}

.node-title {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-weight: bold;
  font-size: var(--font-size-2);
}

.node-image {
  width: calc(16px * var(--pixel-scale));
  aspect-ratio: 1;
  background: var(--bg) no-repeat center;
  background-size: cover;
  border-radius: var(--radius-2);
}

.node-cost {
  margin-left: auto;
  height: calc(10px * var(--pixel-scale));
  padding-left: calc(18px * var(--pixel-scale));
  background: url('/assets/ui/destiny.png') no-repeat center;
  background-size: calc(10px * var(--pixel-scale)) 100%;
  align-self: center;
  display: flex;
  align-items: center;
}
</style>
