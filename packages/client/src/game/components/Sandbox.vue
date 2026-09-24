<script setup lang="ts">
import SandboxTools from './SandboxTools.vue';
import { provideSandbox } from '../composables/useSandbox';
import GameScene from './GameScene.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import DoubleBattlefield from './MinionZone/DoubleBattlefield.vue';

const { players } = defineProps<{
  players: Parameters<typeof provideSandbox>[0]['players'];
}>();

const sandbox = provideSandbox({
  rngSeed: `sandbox-${Math.random().toString(36).substring(2, 15)}`,
  players
});
</script>

<template>
  <GameScene
    v-if="sandbox.client.value.isReady"
    :options="{
      teachingMode: true
    }"
  >
    <template #menu>
      <FancyButton
        :to="{ name: 'ClientHome' }"
        text="Quit"
        class="w-full"
        variant="error"
      />
    </template>

    <template #battlefield>
      <DoubleBattlefield />
    </template>
  </GameScene>
  <SandboxTools :players="players" />
</template>

<style scoped lang="postcss"></style>
