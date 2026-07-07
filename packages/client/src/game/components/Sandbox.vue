<script setup lang="ts">
import SandboxTools from './SandboxTools.vue';
import { useSandbox } from '../composables/useSandbox';
import GameScene from './GameScene.vue';
import FancyButton from '@/ui/components/FancyButton.vue';

const { players } = defineProps<{
  players: Parameters<typeof useSandbox>[0]['players'];
}>();

const sandbox = useSandbox({
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
      <RouterLink
        custom
        v-slot="{ navigate, href }"
        :to="{ name: 'ClientHome' }"
      >
        <FancyButton
          text="Quit"
          class="w-full"
          :href="href"
          variant="error"
          @click="navigate"
        />
      </RouterLink>
    </template>
  </GameScene>
  <SandboxTools
    v-model:auto-switch="sandbox.autoSwitchPlayer.value"
    v-model:player-id="sandbox.playerId.value"
    :players="players"
    :history="sandbox.client.value.history"
    @rewindOneStep="sandbox.rewindOneStep"
    @rewindTo="sandbox.rewindTo"
    @restart="sandbox.restart"
    @refillMana="sandbox.refillMana"
    @addToHand="sandbox.addCardToHand"
    @move="sandbox.moveUnit"
    @activate-unit="sandbox.activateUnit"
    @destroy-unit="sandbox.destroyUnit"
    @draw="sandbox.draw"
    @bounce-unit="sandbox.bounceUnit"
    @deal-damage-to-unit="sandbox.dealDamageToUnit"
    @grant-exp="sandbox.grantExp"
  />
</template>

<style scoped lang="postcss"></style>
