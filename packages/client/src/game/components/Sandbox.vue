<script setup lang="ts">
import {
  PopoverTrigger,
  PopoverRoot,
  PopoverContent,
  ComboboxRoot,
  ComboboxAnchor,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent,
  ComboboxViewport,
  ComboboxItem,
  ComboboxEmpty
} from 'reka-ui';
import { useSandbox } from '../composables/useSandbox';
import GameBoard from './GameBoard.vue';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { Icon } from '@iconify/vue';
import FancyButton from '@/ui/components/FancyButton.vue';

const { players } = defineProps<{
  players: Parameters<typeof useSandbox>[0]['players'];
}>();

const sandbox = useSandbox({
  rngSeed: `sandbox-${Math.random().toString(36).substring(2, 15)}`,
  players
});

const isSandboxPopoverOpened = ref(false);
const card = ref(null);

const allCards = Object.values(CARDS_DICTIONARY).sort((a, b) =>
  a.name.localeCompare(b.name)
);
</script>

<template>
  <GameBoard
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
  </GameBoard>
  <PopoverRoot v-model:open="isSandboxPopoverOpened">
    <PopoverTrigger class="fixed top-0 left-0 bg-gray-10 p-3">
      Sandbox Tools
    </PopoverTrigger>

    <PopoverContent class="flex flex-col gap-2 p-4 bg-gray-10" @keyup.stop>
      <button
        v-for="(player, index) in players"
        :key="player.id"
        @click="sandbox.playerId.value = player.id"
      >
        Switch to Player {{ index + 1 }}
      </button>
      <label>
        <input type="checkbox" v-model="sandbox.autoSwitchPlayer.value" />
        Auto Switch to Active Player
      </label>
      <button @click="sandbox.rewindOneStep()">Rewind one step</button>
      <button @click="sandbox.restart()">Restart Game</button>
      <ComboboxRoot class="relative" v-model="card">
        <ComboboxAnchor
          class="min-w-[160px] inline-flex items-center justify-between rounded-lg border px-[15px] text-xs leading-none h-[35px] gap-[5px] bg-gray-10 text-grass11 shadow-sm focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-grass9 outline-none"
        >
          <ComboboxInput
            class="!bg-transparent outline-none text-grass11 h-full placeholder-stone-400"
            placeholder="Placeholder..."
          />
          <ComboboxTrigger>
            <Icon
              icon="radix-icons:chevron-down"
              class="h-4 w-4 text-grass11"
            />
          </ComboboxTrigger>
        </ComboboxAnchor>

        <ComboboxContent
          class="absolute z-10 w-full mt-1 bg-gray-9 overflow-auto max-h-13 rounded-lg"
        >
          <ComboboxViewport class="p-1">
            <ComboboxEmpty class="text-xs font-medium text-center py-2" />

            <ComboboxItem
              v-for="card in allCards"
              :key="card.id"
              :value="card.id"
              class="text-xs leading-none px-3 py-2 relative select-none hover:bg-gray-10"
            >
              {{ card.name }}
            </ComboboxItem>
          </ComboboxViewport>
        </ComboboxContent>
      </ComboboxRoot>
      <button
        :disabled="!card"
        @click="
          () => {
            sandbox.playCard(card!);
            card = null;
          }
        "
      >
        Play Card
      </button>
      <div class="h-13 overflow-auto">
        <h3 class="font-bold mb-2">History</h3>
        <div
          v-for="(input, index) in sandbox.client.value.history"
          :key="index"
          class="text-sm cursor-pointer hover:underline"
          @click="sandbox.rewindTo(index)"
        >
          {{ input.type }}
        </div>
      </div>
    </PopoverContent>
  </PopoverRoot>
</template>

<style scoped lang="postcss"></style>
