<script setup lang="ts">
import {
  useBoardSide,
  useGameClient,
  useGameState
} from '../composables/useGameClient';
import CardBack from '@/card/components/CardBack.vue';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';
import MinionSlot from './MinionSlot.vue';
import DestinyZone from './DestinyZone.vue';
import CardResizer from './CardResizer.vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import DiscardPile from './DiscardPile.vue';
import BanishPile from './BanishPile.vue';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
const { player } = defineProps<{
  player: string;
}>();

const boardSide = useBoardSide(computed(() => player));
const client = useGameClient();
const state = useGameState();
const isDiscardPileOpened = ref(false);
const isBanishPileOpened = ref(false);

const playerInfos = computed(() => {
  return state.value.entities[player] as PlayerViewModel;
});
const talents = computed(() => {
  return playerInfos.value.getTalents();
});
</script>

<template>
  <section class="board-side">
    <DiscardPile v-model:is-opened="isDiscardPileOpened" :player="player" />
    <BanishPile v-model:is-opened="isBanishPileOpened" :player="player" />
    <div class="hero-zone debug">
      <div class="hero">
        <InspectableCard
          :card-id="boardSide.heroZone.hero"
          :side="player === client.playerId ? 'right' : 'left'"
        >
          <GameCard :card-id="boardSide.heroZone.hero" image-only />
          <div class="talents">
            <div
              v-for="(talent, i) in state.config.MAX_TALENTS"
              :key="talent"
              class="talent"
            >
              <InspectableCard
                v-if="talents[i]"
                :card-id="talents[i].id"
                :side="player === client.playerId ? 'right' : 'left'"
              >
                <div
                  class="talent-filled"
                  :style="{ '--bg': `url('${talents[i].imagePath}')` }"
                />
              </InspectableCard>
            </div>
          </div>
        </InspectableCard>
      </div>
      <div class="artifacts">
        <div class="card"></div>
        <div class="card"></div>
        <div class="card"></div>
      </div>
      <div class="location card-turned debug"></div>
    </div>
    <div class="minion-zone">
      <div class="minion-row">
        <MinionSlot
          v-for="slot in boardSide.attackZone.slots"
          :key="slot.position"
          :minion-slot="slot"
        />
      </div>
      <div class="minion-row">
        <MinionSlot
          v-for="slot in boardSide.defenseZone.slots"
          :key="slot.position"
          :minion-slot="slot"
        />
      </div>
    </div>
    <div class="deck-zone">
      <div class="two-card-pile debug">
        <UiSimpleTooltip>
          <template #trigger>
            <div class="pile" @click="isDiscardPileOpened = true">
              <GameCard
                v-for="(cardId, i) in boardSide.discardPile"
                :key="i"
                :style="{ '--i': i - 1 }"
                :card-id="cardId"
                :interactive="false"
                class="pile-card"
              />
            </div>
          </template>
          Your Discard Pile:
          {{ boardSide.discardPile.length }} cards
        </UiSimpleTooltip>

        <UiSimpleTooltip>
          <template #trigger>
            <div class="pile" @click="isBanishPileOpened = true">
              <GameCard
                v-for="(cardId, i) in boardSide.banishPile"
                :key="i"
                :style="{ '--i': i - 1 }"
                :card-id="cardId"
                :interactive="false"
                class="pile-card"
              />
            </div>
          </template>
          Your Banish Pile:
          {{ boardSide.banishPile.length }} cards
        </UiSimpleTooltip>
      </div>
      <div class="two-card-pile debug">
        <UiSimpleTooltip>
          <template #trigger>
            <div class="pile">
              <CardResizer
                v-for="i in boardSide.mainDeck.remaining"
                :key="i"
                :style="{ '--i': i - 1 }"
              >
                <CardBack class="pile-card" />
              </CardResizer>
            </div>
          </template>
          Your Main Deck: {{ boardSide.mainDeck.remaining }} cards
        </UiSimpleTooltip>

        <UiSimpleTooltip>
          <template #trigger>
            <div class="pile">
              <CardResizer
                v-for="i in boardSide.destinyDeck.remaining"
                :key="i"
                :style="{ '--i': i - 1 }"
              >
                <CardBack class="pile-card" />
              </CardResizer>
            </div>
          </template>
          Your Destiny Deck: {{ boardSide.destinyDeck.remaining }} cards
        </UiSimpleTooltip>
      </div>
      <DestinyZone :player-id="boardSide.playerId" />
    </div>
  </section>
</template>

<style scoped lang="postcss">
.card-turned {
  aspect-ratio: var(--card-ratio-inverted);
  position: relative;
}

:global(.board *) {
  transform-style: preserve-3d;
}

.board-side {
  display: grid;
  gap: var(--size-2);
  grid-template-columns: 0.8fr 2fr 0.6fr;
  justify-self: center;
  > * {
    height: calc(var(--board-height) / 2);
  }
}

.hero-zone {
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: 3fr 1.5fr 1fr;
  gap: var(--size-2);
  position: relative;
  .hero {
    justify-self: center;
    aspect-ratio: var(--card-ratio);
    position: relative;
    & > * {
      position: absolute;
      inset: 0;
    }
  }
  .artifacts {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--size-2);
    padding-inline: var(--size-2);
  }
  .location {
    justify-self: center;
  }
}

.minion-zone {
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: 50% 50%;
  gap: var(--size-2);
  justify-self: center;

  .minion-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--size-2);
    justify-items: center;
    > * {
      aspect-ratio: var(--card-ratio);
    }
    align-items: center;
  }
}

.deck-zone {
  display: grid;
  grid-auto-flow: row;
  gap: var(--size-2);
  justify-self: start;
  grid-template-rows: minmax(0, 2fr) minmax(0, 2fr) minmax(0, 1.8fr);

  .two-card-pile {
    display: grid;
    grid-template-columns: 1fr 1fr;
    place-items: center;
    gap: var(--size-2);
    > * {
      height: 100%;
      aspect-ratio: var(--card-ratio);
    }
  }
}

.pile {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  position: relative;
  > * {
    grid-row: 1;
    grid-column: 1;
    transform: translateZ(calc(var(--i) * 0.8px));
    height: 100%;
    /* aspect-ratio: var(--card-ratio); */
  }

  .pile-card {
    height: 100%;
    position: absolute;
    aspect-ratio: var(--card-ratio);
  }
}

.talents {
  position: absolute;
  top: 0;
  left: -70px;
  display: grid;
  grid-template-rows: repeat(v-bind('state.config.MAX_TALENTS'), 1fr);
  gap: var(--size-1);
  height: 100%;
  .talent {
    background-color: black;
    border-radius: var(--radius-round);
    aspect-ratio: 1;
  }
  .talent-filled {
    background: var(--bg) no-repeat center;
    background-size: 200%;
    border-radius: var(--radius-round);
    aspect-ratio: 1;
  }
}
</style>
