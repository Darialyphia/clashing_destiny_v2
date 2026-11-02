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
import BattlefieldScoringFX from './BattlefieldScoringFX.vue';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';

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

const myScoreEl = useTemplateRef('myScoreEl');
const opponentScoreEl = useTemplateRef('opponentScoreEl');
const scoringFx = useTemplateRef('scoringFx');

// played before AFTER_SCORE so the scoring minion only shows as exhausted
// once its influence has been transferred (see useBoardCardFx)
useFxEvent(FX_EVENTS.PRE_AFTER_SCORE, async event => {
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

  const isMine = card.player.equals(myPlayer.value);
  const previousScore = isMine
    ? battlefield.commandmentScore
    : battlefield.opponentCommandmentScore;
  const otherScore = isMine
    ? battlefield.opponentCommandmentScore
    : battlefield.commandmentScore;
  const displayedScore = isMine ? myScore : opponentScore;

  const minion = ui.value.DOMSelectors.cardOnBoard(event.card).element;
  const location = ui.value.DOMSelectors.cardOnBoard(event.destinyCard).element;
  const scorerCounter = isMine ? myScoreEl.value : opponentScoreEl.value;
  const otherCounter = isMine ? opponentScoreEl.value : myScoreEl.value;
  if (minion && location && scorerCounter && otherCounter && scoringFx.value) {
    await scoringFx.value.play({
      minion,
      badge:
        ui.value.DOMSelectors.cardCommandment(event.card).element ?? minion,
      location,
      scorerCounter,
      otherCounter,
      amount: event.newScore - previousScore,
      isAlly: isMine,
      isTakingTheLead:
        previousScore <= otherScore && event.newScore > otherScore,
      onTick: amount => {
        displayedScore.value += amount;
      }
    });
  }

  // update the battlefield that was scored, not always the left one
  const key =
    battlefield.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD
      ? 'rightBattlefield'
      : 'leftBattlefield';
  const currentBattlefield = myPlayer.value.boardSide[key];
  myPlayer.value.update({
    boardSide: {
      ...myPlayer.value.boardSide,
      [key]: {
        ...currentBattlefield,
        commandmentScore: card.player.equals(myPlayer.value)
          ? event.newScore
          : currentBattlefield.commandmentScore,
        opponentCommandmentScore: card.player.equals(myPlayer.value)
          ? currentBattlefield.opponentCommandmentScore
          : event.newScore
      }
    }
  });
});
</script>

<template>
  <button
    class="battlefield"
    :class="{
      'is-right': battlefield.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD,
      win: battlefield.commandmentScore > battlefield.opponentCommandmentScore,
      lose: battlefield.commandmentScore < battlefield.opponentCommandmentScore
    }"
    @mouseup="onMouseup"
  >
    <BoardCard v-if="battlefield.destinyCard" :card="battlefield.destinyCard" />

    <BattlefieldScoringFX ref="scoringFx" />

    <div ref="myScoreEl" class="my-score">
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
    <div ref="opponentScoreEl" class="opponent-score">
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

/* stacked beside the location card, facing the middle column, so they never cover the head of a minion in the middle space */
.my-score,
.opponent-score {
  position: absolute;
  z-index: 0;
  left: calc(100% + 6px);
  .battlefield.is-right & {
    left: auto;
    right: calc(100% + 6px);
  }
  font-size: 24px;
  font-weight: bold;
  color: var(--color-text);
  display: grid;
  place-content: center;
  width: 38px;
  aspect-ratio: 1;
}
.opponent-score {
  top: 0;
  background: url('@/assets/ui/opponent-score.png');
  background-size: cover;
}
.my-score {
  bottom: 0;
  background: url('@/assets/ui/my-score.png');
  background-size: cover;
}
</style>
