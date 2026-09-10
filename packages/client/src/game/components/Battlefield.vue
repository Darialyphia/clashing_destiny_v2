<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { useGameClient, useGameUi } from '../composables/useGameClient';
import BoardCard from './BoardCard.vue';

const { battlefield } = defineProps<{
  battlefield: PlayerViewModel['leftBattlefield'];
}>();

const { playerId, client } = useGameClient();

const ui = useGameUi();

const canInteract = computed(() => {
  if (playerId.value !== battlefield.player.id) return false;
  if (!ui.value.selectedCard) return false;
  if (!ui.value.selectedCard.canScore) return false;

  const card = ui.value.selectedCard;
  return battlefield.spaces.some(space => space.card?.equals(card));
});

const onMouseup = (e: MouseEvent) => {
  if (e.button !== 0) return;
  if (!canInteract.value) return;

  client.value.score(ui.value.selectedCard!.id);
};
</script>

<template>
  <button
    class="battlefield"
    :class="{
      win: battlefield.commandmentScore > battlefield.opponentCommandmentScore,
      lose: battlefield.commandmentScore < battlefield.opponentCommandmentScore
    }"
    @mouseup="onMouseup"
  >
    <BoardCard :card="battlefield.destinyCard" />

    <div class="my-score">
      <div
        class="dual-text"
        :data-text="battlefield.commandmentScore"
        style="
          --dual-text-stroke-offset-y: calc(-1px * var(--pixel-scale));
          --dual-text-offset-y: calc(1px * var(--pixel-scale));
        "
      >
        {{ battlefield.commandmentScore }}
      </div>
    </div>
    <div class="opponent-score">
      <div
        class="dual-text"
        :data-text="battlefield.opponentCommandmentScore"
        style="
          --dual-text-stroke-offset-y: calc(-1px * var(--pixel-scale));
          --dual-text-offset-y: calc(1px * var(--pixel-scale));
        "
      >
        {{ battlefield.opponentCommandmentScore }}
      </div>
    </div>
  </button>
</template>

<style scoped lang="postcss">
.battlefield {
  position: relative;
  z-index: 1;

  &.win {
    .my-score {
      --top-color: var(--green-2);
      --bottom-color: var(--green-5);
    }
    .opponent-score {
      --top-color: var(--red-3);
      --bottom-color: var(--red-6);
    }
  }

  &.lose {
    .my-score {
      --top-color: var(--red-3);
      --bottom-color: var(--red-6);
    }
    .opponent-score {
      --top-color: var(--green-2);
      --bottom-color: var(--green-5);
    }
  }
}

.my-score,
.opponent-score {
  position: absolute;
  left: 50%;
  translate: -50% 0;
  font-size: 24px;
  font-weight: bold;
  color: var(--color-text);
  display: grid;
  place-content: center;
  width: 38px;
  aspect-ratio: 1;
}
.opponent-score {
  top: -19px;
  background: url('@/assets/ui/opponent-score.png');
  background-size: cover;
}
.my-score {
  bottom: -19px;
  background: url('@/assets/ui/my-score.png');
  background-size: cover;
}
</style>
