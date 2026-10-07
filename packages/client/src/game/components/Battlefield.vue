<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import {
  useFxEvent,
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer,
  useOpponentPlayer
} from '../composables/useGameClient';
import BoardCard from './BoardCard/index.vue';
import { waitFor } from '@game/shared';

const { battlefield } = defineProps<{
  battlefield: PlayerViewModel['leftBattlefield'];
}>();

const { playerId, client } = useGameClient();

const ui = useGameUi();
const state = useGameState();

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
  if (!ui.value.selectedCard) return;
  client.value.score(ui.value.selectedCard!.id);
};

const myPlayer = useMyPlayer();
const opponent = useOpponentPlayer();

const scoringPlayer = ref<string | null>(null);
const myScore = ref(battlefield.commandmentScore);
const opponentScore = ref(battlefield.opponentCommandmentScore);

watch(
  () => battlefield.commandmentScore,
  newScore => {
    gsap.to(myScore, {
      value: newScore,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => {
        myScore.value = Number(myScore.value.toFixed(0));
      }
    });
  }
);
watch(
  () => battlefield.opponentCommandmentScore,
  newScore => {
    gsap.to(opponentScore, {
      value: newScore,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => {
        opponentScore.value = Number(opponentScore.value.toFixed(0));
      }
    });
  }
);

useFxEvent(FX_EVENTS.AFTER_SCORE, async event => {
  const card = state.value.entities[event.card] as CardViewModel;

  const battlefields = [
    myPlayer.value.leftBattlefield,
    myPlayer.value.rightBattlefield,
    opponent.value.leftBattlefield,
    opponent.value.rightBattlefield
  ];
  const scoredBattlefield = battlefields.find(
    bf => bf.id === event.battlefield
  )!;
  if (scoredBattlefield.zone !== battlefield.zone) return;

  myPlayer.value.update({
    boardSide: {
      ...myPlayer.value.boardSide,
      leftBattlefield: {
        ...myPlayer.value.boardSide.leftBattlefield,
        commandmentScore: card.player.equals(myPlayer.value)
          ? event.newScore
          : myPlayer.value.boardSide.leftBattlefield.commandmentScore,
        opponentCommandmentScore: card.player.equals(myPlayer.value)
          ? myPlayer.value.boardSide.leftBattlefield.opponentCommandmentScore
          : event.newScore
      }
    }
  });
  scoringPlayer.value = card.player.id;
  await waitFor(1000);
  scoringPlayer.value = null;
});
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
    <BoardCard v-if="battlefield.destinyCard" :card="battlefield.destinyCard" />

    <div class="my-score" :class="{ scoring: scoringPlayer === myPlayer.id }">
      <div
        :id="
          ui.DOMSelectors.influence(
            myPlayer.id,
            battlefield.destinyCard.location!
          ).id
        "
        class="dual-text"
        :data-text="myScore"
        style="
          --dual-text-stroke-offset-y: calc(-1px * var(--pixel-scale));
          --dual-text-offset-y: calc(1px * var(--pixel-scale));
        "
      >
        {{ myScore }}
      </div>
    </div>
    <div
      class="opponent-score"
      :class="{ scoring: scoringPlayer === opponent.id }"
    >
      <div
        class="dual-text"
        :data-text="opponentScore"
        :id="
          ui.DOMSelectors.influence(
            opponent.id,
            battlefield.destinyCard.location!
          ).id
        "
        style="
          --dual-text-stroke-offset-y: calc(-1px * var(--pixel-scale));
          --dual-text-offset-y: calc(1px * var(--pixel-scale));
        "
      >
        {{ opponentScore }}
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
  &.scoring {
    animation: scoring 0.4s var(--ease-3);
  }
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

@keyframes scoring {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
