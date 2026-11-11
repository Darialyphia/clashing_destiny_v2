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
import BackButton from '@/shared/components/BackButton.vue';
import DraggedBoosterPack from './DraggedBoosterPack.vue';
import { useEventListener } from '@vueuse/core';

definePage({
  name: 'Boosters',
  meta: {
    requiresAuth: true,
    wrapperClass: 'page-blur'
  }
});

const { data: unopenedPacks } = useUnopenedBoosterPacks();
type UnopenedPack = NonNullable<typeof unopenedPacks.value>['packs'][number];

const { mutate: openPack, isLoading: isOpeningPack } = useOpenBoosterPack(
  data => {
    latestPackOpened.value = data.cards.map(card => ({
      blueprint: CARDS_DICTIONARY[card.blueprintId],
      isFoil: card.isFoil
    }));
    pendingPack.value = null;
  }
);
const latestPackOpened = ref<
  Array<{
    blueprint: CardBlueprint;
    isFoil: boolean;
  }>
>([]);

const packBg = (pack: UnopenedPack) => assets[`ui/packs/${pack.icon}`].css;

const contentRef = useTemplateRef('content');
const draggedPack = ref<UnopenedPack | null>(null);
const pendingPack = ref<UnopenedPack | null>(null);
const pointer = ref({ x: 0, y: 0 });
const isPackOverDropZone = ref(false);

const onPackPointerDown = (pack: UnopenedPack, e: PointerEvent) => {
  if (isOpeningPack.value || pendingPack.value) return;
  pointer.value = { x: e.clientX, y: e.clientY };
  draggedPack.value = pack;
};

useEventListener(
  'pointermove',
  (e: PointerEvent) => {
    if (!draggedPack.value) return;
    pointer.value = { x: e.clientX, y: e.clientY };
    isPackOverDropZone.value =
      contentRef.value?.isOverDropZone(e.clientX, e.clientY) ?? false;
  },
  { passive: true }
);

useEventListener('pointerup', async (e: PointerEvent) => {
  const pack = draggedPack.value;
  if (!pack) return;
  draggedPack.value = null;
  isPackOverDropZone.value = false;

  if (!contentRef.value?.isOverDropZone(e.clientX, e.clientY)) return;

  pendingPack.value = pack;
  try {
    await openPack({ packId: pack.id });
  } finally {
    pendingPack.value = null;
  }
});
</script>

<template>
  <div class="page" :class="{ 'is-dragging-pack': !!draggedPack }">
    <BoosterPackContent
      v-if="unopenedPacks"
      ref="content"
      :cards="latestPackOpened"
      :is-dragging-pack="!!draggedPack"
      :is-pack-over-drop-zone="isPackOverDropZone"
      :pending-pack-bg="pendingPack ? packBg(pendingPack) : null"
      class="h-screen"
    >
      <template #done>
        <div class="flex flex-col gap-8">
          <BackButton />

          <div
            v-if="unopenedPacks.packs.length"
            class="unopened-packs"
            :data-count="unopenedPacks.packs.length"
          >
            <button
              v-for="(pack, index) of unopenedPacks.packs"
              class="unopened-pack"
              :class="{
                'is-dragged':
                  draggedPack?.id === pack.id || pendingPack?.id === pack.id
              }"
              :style="{
                '--bg': packBg(pack),
                zIndex: unopenedPacks.packs.length - index
              }"
              :key="pack.id"
              :disabled="isOpeningPack"
              @pointerdown.prevent="onPackPointerDown(pack, $event)"
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

    <DraggedBoosterPack
      v-if="draggedPack"
      :bg="packBg(draggedPack)"
      :x="pointer.x"
      :y="pointer.y"
    />
  </div>
</template>

<style scoped lang="postcss">
.page {
  height: 100dvh;
  background-image: url('@/assets/backgrounds/main-menu-overlay.png');
  background-size: 100% 100%;

  &.is-dragging-pack,
  &.is-dragging-pack :deep(*) {
    cursor: grabbing !important;
  }
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
  cursor: grab;
  touch-action: none;
  &:disabled {
    filter: grayscale(100%);
  }

  &.is-dragged {
    visibility: hidden;
  }

  &:hover:not(.is-dragged) {
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
