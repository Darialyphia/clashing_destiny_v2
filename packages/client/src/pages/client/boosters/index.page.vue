<script setup lang="ts">
import BoosterPackContent from './BoosterPackContent.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import {
  useOpenBoosterPack,
  useUnopenedBoosterPacks
} from './composables/useBoosterPack';
import { assets } from '@/assets';

definePage({
  name: 'Boosters',
  meta: {
    requiresAuth: true,
    wrapperClass: 'page-blur'
  }
});

const { data: unopenedPacks } = useUnopenedBoosterPacks();
const { mutate: openPack, isLoading: isOpeningPack } = useOpenBoosterPack(
  data => {
    latestPackOpened.value = data.cards.map(card => ({
      blueprint: CARDS_DICTIONARY[card.blueprintId],
      isFoil: card.isFoil
    }));
  }
);
const latestPackOpened = ref<
  Array<{
    blueprint: CardBlueprint;
    isFoil: boolean;
  }>
>([]);
</script>

<template>
  <div class="page">
    <BoosterPackContent
      v-if="unopenedPacks"
      :cards="latestPackOpened"
      class="h-screen"
    >
      <template #done>
        <div class="flex flex-col gap-8">
          <FancyButton
            class="primary-button"
            text="Back"
            :to="{ name: 'ClientHome' }"
          />
          <div
            v-if="unopenedPacks.packs.length"
            class="unopened-packs"
            :data-count="unopenedPacks.packs.length"
          >
            <button
              v-for="(pack, index) of unopenedPacks.packs"
              class="unopened-pack"
              :style="{
                '--bg': assets[`ui/packs/${pack.icon}`].css,
                zIndex: unopenedPacks.packs.length - index
              }"
              :key="pack.id"
              :disabled="isOpeningPack"
              @click="openPack({ packId: pack.id })"
            />
          </div>

          <div v-else class="flex flex-col gap-3">
            <p>You have no pack to open right now.</p>
            <FancyButton
              class="secondary-button"
              size="md"
              variant="info"
              text="Buy more packs"
              :to="{ name: 'Shop' }"
            />
          </div>
        </div>
      </template>
    </BoosterPackContent>
  </div>
</template>

<style scoped lang="postcss">
.page {
  min-height: 100vh;
  background-image: url('@/assets/backgrounds/main-menu-overlay.png');
}

.unopened-pack {
  position: absolute;
  width: calc(95px * 2);
  height: calc(98px * 2);
  background: var(--bg);
  background-size: cover;
  left: calc(6px * (var(--child-index) - 1) - 30px);
  bottom: 0;
  transition: transform 0.3s var(--ease-bounce-2);
  &:disabled {
    filter: grayscale(100%);
  }

  &:hover {
    filter: drop-shadow(0 0 10px yellow);
    transform: translateY(30px);
  }
}

.unopened-packs {
  position: relative;
  height: calc(98px * 2);
  &::after {
    content: attr(data-count);
    position: absolute;
    bottom: -15px;
    left: 50%;
    z-index: 100;
    background: var(--red-10);
    color: white;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-3);
    border: solid 3px black;
  }
}
</style>
