<script setup lang="ts">
import { GIFT_STATES } from '@game/api';
import { useLogout } from '@/auth/composables/useLogout';
import { useGifts } from '@/player/composables/useGifts';

const { data: gifts } = useGifts();
const unclaimedGiftsCount = computed(() => {
  return (
    gifts.value?.filter(gift => gift.state === GIFT_STATES.ISSUED).length ?? 0
  );
});

const { mutate: logout } = useLogout();
</script>

<template>
  <ul class="main-menu">
    <li>
      <RouterLink
        :to="{ name: 'SelectMode' }"
        class="dual-text"
        data-text="Play"
      >
        <span>Play</span>
      </RouterLink>
    </li>
    <li>
      <RouterLink
        :to="{ name: 'Collection' }"
        class="dual-text"
        data-text="Collection"
      >
        Collection
      </RouterLink>
    </li>
    <li class="hot">
      <RouterLink :to="{ name: 'Shop' }" class="dual-text" data-text="Shop">
        Shop
      </RouterLink>
    </li>
    <li>
      <RouterLink
        :to="{ name: 'Gifts' }"
        class="dual-text relative"
        data-text="Gifts"
      >
        Gifts
        <span class="gift-chip" v-if="unclaimedGiftsCount > 0">
          {{ unclaimedGiftsCount }}
        </span>
      </RouterLink>
    </li>
    <li>
      <button @click="logout({})" class="dual-text" data-text="Logout">
        Logout
      </button>
    </li>
  </ul>
</template>

<style scoped lang="postcss">
.main-menu {
  --dual-text-stroke-offset-y: -6px;
  position: absolute;
  top: 20%;
  left: var(--size-13);
  font-size: var(--font-size-6);
  font-weight: 700;
  color: transparent;

  @screen lt-lg {
    font-size: var(--font-size-4);
    top: 32%;
    left: var(--size-9);
  }

  :is(a, button):hover {
    filter: brightness(1.3);
  }

  li {
    width: fit-content;
    transition: all 0.3s ease;
    transition-delay: calc(0.05s * var(--child-index));
    @starting-style {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
  li.hot {
    position: relative;
    &::after {
      content: 'HOT!';
      position: absolute;
      top: var(--size-2);
      right: -25px;
      transform: translate(50%, -50%);
      background-color: var(--red-8);
      color: white;
      font-size: var(--font-size-0);
      font-weight: var(--font-weight-7);
      padding: 0.1rem 0.4rem;
      border-radius: var(--radius-2);
      @screen lt-lg {
        font-size: var(--font-size-00);
      }
    }
  }
}

.gift-chip {
  margin-left: var(--size-1);
  padding-left: var(--size-2);
  padding-right: var(--size-2);
  padding-top: var(--size-05);
  padding-bottom: var(--size-05);
  font-size: var(--font-size-0);
  font-weight: 500;
  background-color: var(--red-8);
  color: white;
  border-radius: var(--radius-round);
  position: absolute;
  top: 0;
  left: 100%;
  @screen lt-lg {
    font-size: var(--font-size-00);
  }
}
</style>
