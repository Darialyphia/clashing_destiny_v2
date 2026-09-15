import type { Ref } from 'vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { gameStateRef } from './gameStateRef';
import type { ModifierViewModel } from '@game/engine/src/client/view-models/modifier.model';

export const useModifierGroups = (card: Ref<CardViewModel>) => {
  const modifierGroups = gameStateRef(() => {
    const raw =
      card.value.modifiers.filter(
        modifier => modifier.name && modifier.description && modifier.stacks > 0
      ) ?? [];

    const result: Array<{
      key: string;
      playerId: string;
      totalStacks: number;
      icon?: string;
      name: string;
      description: string;
      sources: ModifierViewModel['source'][];
    }> = [];
    raw.forEach(modifier => {
      let group = result.find(
        g =>
          g.key === modifier.groupKey &&
          g.playerId === modifier.source.player.id
      );
      if (!group) {
        group = {
          key: modifier.groupKey,
          playerId: modifier.source.player.id,
          totalStacks: 0,
          icon: modifier.icon,
          name: modifier.name!,
          description: modifier.description!,
          sources: [modifier.source]
        };
        result.push(group);
      } else {
        group.sources.push(modifier.source);
      }
      group.totalStacks += modifier.stacks;
    });
    return result;
  });

  return modifierGroups;
};
