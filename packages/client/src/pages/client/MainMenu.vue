<script setup lang="ts">
import { useLogout } from '@/auth/composables/useLogout';

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
</style>
