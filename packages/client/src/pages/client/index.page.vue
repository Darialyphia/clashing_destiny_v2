<script setup lang="ts">
import { useAuthedQuery } from '@/auth/composables/useAuth';
import { api } from '@game/api';
import { useMe } from '@/auth/composables/useMe';
import CraftignShardIcon from '@/player/components/CraftignShardIcon.vue';
import GodlIcon from '@/player/components/GodlIcon.vue';
import PlayerBadge from '@/player/components/PlayerBadge.vue';
import MainMenu from './MainMenu.vue';
definePage({
  name: 'ClientHome',
  meta: {
    requiresAuth: true
  }
});

const { data: unopenedPacks } = useAuthedQuery(api.cards.unopenedPacks, {});

const boosterPackButtonLabel = computed(() => {
  return unopenedPacks.value?.packs.length > 1
    ? `${unopenedPacks.value.packs.length} packs available`
    : `${unopenedPacks.value.packs.length} pack available`;
});

const { data: me } = useMe();
</script>

<template>
  <div class="client-home-page">
    <MainMenu />

    <RouterLink
      v-if="unopenedPacks?.packs.length > 0"
      class="boosters"
      :to="{ name: 'Boosters' }"
      aria-label="boosters"
    >
      <span class="dual-text" :data-text="boosterPackButtonLabel">
        {{ boosterPackButtonLabel }}
      </span>
    </RouterLink>

    <PlayerBadge
      v-if="me"
      :name="me.username"
      class="flex gap-3 absolute top-4 left-8"
    />

    <div class="currencies absolute top-4 right-8">
      <GodlIcon />
      <span class="dual-text" :data-text="me.wallet.gold">
        {{ me.wallet.gold }}
      </span>
      <CraftignShardIcon />
      <span class="dual-text" :data-text="me.wallet.craftingShards">
        {{ me.wallet.craftingShards }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.client-home-page {
  transform-style: preserve-3d;
  perspective: 1300px;
  height: 100dvh;
  z-index: 0;
}

.boosters {
  display: block;
  width: 314px;
  height: 219px;
  background-image: url('@/assets/ui/card/v3/boosters.png');
  background-size: cover;
  position: absolute;
  bottom: var(--size-12);
  left: var(--size-13);
  display: grid;
  place-content: center;
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  z-index: 0;
  transition: all 0.3s ease;
  &:hover {
    filter: brightness(1.3) drop-shadow(0 0 5px var(--yellow-3));
  }
}

.currencies {
  --pixel-scale: 1;
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-size: var(--font-size-3);
  --dual-text-stroke-offset-y: calc(-1px * var(--pixel-scale));
  background: #000000aa;
  padding: var(--size-2) var(--size-3);
  border-radius: var(--radius-pill);
}
</style>
