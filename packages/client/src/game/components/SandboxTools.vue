<script setup lang="ts">
import {
  PopoverTrigger,
  PopoverRoot,
  PopoverContent,
  ComboboxRoot,
  ComboboxAnchor,
  ComboboxPortal,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent,
  ComboboxViewport,
  ComboboxItem,
  ComboboxEmpty,
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent
} from 'reka-ui';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { Icon } from '@iconify/vue';
import { ref } from 'vue';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import {
  useGameState,
  useGameUi,
  usePlayer1,
  useUnits
} from '../composables/useGameClient';
import { isDefined, type Point } from '@game/shared';
import UiSwitch from '@/ui/components/UiSwitch.vue';

const { players } = defineProps<{
  players: Array<{ id: string }>;
  history: SerializedInput[];
}>();

const emit = defineEmits<{
  rewindOneStep: [];
  rewindTo: [index: number];
  restart: [];
  refillMana: [];
  addToHand: [cardId: string];
  move: [unitId: string, pos: Point, silent: boolean];
  activateUnit: [unitId: string];
  destroyUnit: [unitId: string, silent: boolean];
  bounceUnit: [unitId: string, silent: boolean];
  dealDamageToUnit: [unitId: string, amount: number, silent: boolean];
  draw: [];
}>();

const state = useGameState();
const ui = useGameUi();

const isSandboxPopoverOpened = ref(false);
const card = ref<string | null>(null);
const unit = ref<string | null>(null);
const position = ref({ x: 0, y: 0 });
watch(
  () => ui.value.selectedUnit,
  selected => {
    if (selected) {
      unit.value = selected.id;
      position.value = { x: selected.x, y: selected.y };
    }
  }
);
const playerId = defineModel<string>('playerId', { required: true });
const autoSwitchPlayer = defineModel<boolean>('autoSwitch', {
  required: true
});

const allCards = Object.values(CARDS_DICTIONARY).sort((a, b) =>
  a.name.localeCompare(b.name)
);
const units = useUnits();

const p1 = usePlayer1();
const triggerEvents = ref(true);
const damageToDeal = ref(0);
</script>

<template>
  <PopoverRoot v-model:open="isSandboxPopoverOpened">
    <PopoverTrigger class="sandbox-trigger">Sandbox Tools</PopoverTrigger>

    <PopoverContent as-child>
      <div class="sandbox-content fancy-scrollbar" @keyup.stop>
        <AccordionRoot class="accordion-root" type="multiple">
          <!-- Player Controls Section -->
          <AccordionItem class="accordion-item" value="player-controls">
            <AccordionHeader class="accordion-header">
              <AccordionTrigger class="accordion-trigger">
                <span>Player Controls</span>
                <Icon
                  icon="radix-icons:chevron-down"
                  class="accordion-chevron"
                />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="accordion-content">
              <div class="button-group">
                <button
                  v-for="(player, index) in players"
                  :key="player.id"
                  class="btn"
                  :class="{ p1: player.id === p1.id, p2: player.id !== p1.id }"
                  @click="playerId = player.id"
                >
                  Switch to Player {{ index + 1 }}
                </button>
              </div>
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="autoSwitchPlayer"
                  class="checkbox"
                />
                <span>Auto Switch to Active Player</span>
              </label>
            </AccordionContent>
          </AccordionItem>

          <!-- Game Controls Section -->
          <AccordionItem class="accordion-item" value="game-controls">
            <AccordionHeader class="accordion-header">
              <AccordionTrigger class="accordion-trigger">
                <span>Game Controls</span>
                <Icon
                  icon="radix-icons:chevron-down"
                  class="accordion-chevron"
                />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="accordion-content">
              <div class="button-group">
                <button @click="emit('restart')" class="btn">
                  Restart Game
                </button>
                <button @click="emit('rewindOneStep')" class="btn">
                  Rewind One Step
                </button>
              </div>
              <h3 class="section-title mt-3">Rewind to :</h3>
              <div class="history-list fancy-scrollbar">
                <span v-if="history.length === 0" class="history-item italic">
                  No history.
                </span>
                <div
                  v-for="(input, index) in history.toReversed()"
                  :key="index"
                  class="history-item"
                  :class="{
                    p1: input.payload.playerId === p1.id,
                    p2: input.payload.playerId !== p1.id
                  }"
                  @click="emit('rewindTo', index)"
                >
                  {{ input.type }}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <!-- Mana Controls Section -->
          <AccordionItem class="accordion-item" value="mana-controls">
            <AccordionHeader class="accordion-header">
              <AccordionTrigger class="accordion-trigger">
                <span>Mana Controls</span>
                <Icon
                  icon="radix-icons:chevron-down"
                  class="accordion-chevron"
                />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="accordion-content">
              <button @click="emit('refillMana')" class="btn mt-2">
                Refill Mana
              </button>
            </AccordionContent>
          </AccordionItem>

          <!-- Cards Section -->
          <AccordionItem class="accordion-item" value="cards">
            <AccordionHeader class="accordion-header">
              <AccordionTrigger class="accordion-trigger">
                <span>Cards</span>
                <Icon
                  icon="radix-icons:chevron-down"
                  class="accordion-chevron"
                />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="accordion-content">
              <button @click="emit('draw')" class="btn mb-2">Draw card</button>
              <ComboboxRoot class="relative" v-model="card">
                <ComboboxAnchor class="combobox-anchor">
                  <ComboboxInput
                    class="combobox-input"
                    placeholder="Search cards..."
                  />
                  <ComboboxTrigger>
                    <Icon
                      icon="radix-icons:chevron-down"
                      class="chevron-icon"
                    />
                  </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxPortal to="#sandbox-tools-combobox-portal">
                  <ComboboxContent
                    align="start"
                    position="popper"
                    position-strategy="fixed"
                    as-child
                  >
                    <div class="combobox-content">
                      <ComboboxViewport class="combobox-viewport">
                        <ComboboxEmpty class="combobox-empty" />

                        <ComboboxItem
                          v-for="card in allCards"
                          :key="card.id"
                          :value="card.id"
                          class="combobox-item"
                        >
                          {{ card.name }}
                        </ComboboxItem>
                      </ComboboxViewport>
                    </div>
                  </ComboboxContent>
                </ComboboxPortal>
              </ComboboxRoot>
              <button
                :disabled="!card"
                @click="
                  () => {
                    emit('addToHand', card!);
                    card = null;
                  }
                "
                class="btn my-2"
              >
                Add to Hand
              </button>
            </AccordionContent>
          </AccordionItem>

          <!-- Units Section -->
          <AccordionItem class="accordion-item" value="units">
            <AccordionHeader class="accordion-header">
              <AccordionTrigger class="accordion-trigger">
                <span>Units</span>
                <Icon
                  icon="radix-icons:chevron-down"
                  class="accordion-chevron"
                />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="accordion-content">
              <ComboboxRoot class="relative" v-model="unit">
                <ComboboxAnchor class="combobox-anchor">
                  <ComboboxInput
                    class="combobox-input"
                    placeholder="Search units..."
                  />
                  <ComboboxTrigger>
                    <Icon
                      icon="radix-icons:chevron-down"
                      class="chevron-icon"
                    />
                  </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxPortal to="#sandbox-tools-combobox-portal">
                  <ComboboxContent
                    align="start"
                    position="popper"
                    position-strategy="fixed"
                    as-child
                  >
                    <div class="combobox-content">
                      <ComboboxViewport class="combobox-viewport">
                        <ComboboxEmpty class="combobox-empty" />

                        <ComboboxItem
                          v-for="unit in units"
                          :key="unit.id"
                          :value="unit.id"
                          class="combobox-item"
                        >
                          {{ unit.getCard().name }} ({{ unit.x + 1 }},
                          {{ unit.y + 1 }})
                        </ComboboxItem>
                      </ComboboxViewport>
                    </div>
                  </ComboboxContent>
                </ComboboxPortal>
              </ComboboxRoot>

              <div class="flex gap-2 items-center mt-3">
                <UiSwitch v-model="triggerEvents" />
                <span class="option-title">
                  Trigger Events (can cause issues if disabled)
                </span>
              </div>

              <div class="flex gap-2 items-center mt-2">
                <button
                  :disabled="!unit"
                  @click="emit('activateUnit', unit!)"
                  class="btn"
                >
                  Activate
                </button>
                <button
                  :disabled="!unit"
                  @click="
                    () => {
                      emit('destroyUnit', unit!, !triggerEvents);
                      unit = null;
                    }
                  "
                  class="btn"
                >
                  Destroy
                </button>
                <button
                  :disabled="!unit"
                  @click="
                    () => {
                      emit('bounceUnit', unit!, !triggerEvents);
                      unit = null;
                    }
                  "
                  class="btn"
                >
                  Return to hand
                </button>
              </div>

              <div class="position-controls">
                <label>X</label>
                <select v-model="position.x" class="position-select">
                  <option
                    v-for="i in state.board.columns"
                    :key="i"
                    :value="i - 1"
                  >
                    {{ i }}
                  </option>
                </select>
                <label>Y</label>
                <select v-model="position.y" class="position-select">
                  <option v-for="i in state.board.rows" :key="i" :value="i - 1">
                    {{ i }}
                  </option>
                </select>

                <button
                  :disabled="!unit"
                  @click="
                    () => {
                      emit(
                        'move',
                        unit!,
                        { x: position.x, y: position.y },
                        !triggerEvents
                      );
                      unit = null;
                    }
                  "
                  class="btn flex-1 text-center"
                >
                  Move
                </button>
              </div>

              <div class="input-group mt-2">
                <input
                  id="damage-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Damage to deal"
                  class="number-input flex-1"
                  v-model.number="damageToDeal"
                />
                <button
                  :disabled="!isDefined(damageToDeal) || !unit"
                  @click="
                    emit(
                      'dealDamageToUnit',
                      unit!,
                      damageToDeal!,
                      !triggerEvents
                    )
                  "
                  class="btn"
                >
                  Deal damage
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>

        <div id="sandbox-tools-combobox-portal" />
      </div>
    </PopoverContent>
  </PopoverRoot>
</template>

<style lang="postcss" scoped>
.sandbox-trigger {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  background-color: var(--gray-10);
  padding: 0.5rem 1rem;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-radius: 0 0 0.5rem 0;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background-color 150ms;
}

.sandbox-trigger:hover {
  background-color: var(--gray-11);
}

.sandbox-content {
  --sandbox-tools-width: 23rem;
  --sandbox-tools-padding: var(--size-4);
  display: flex;
  flex-direction: column;
  padding: var(--sandbox-tools-padding);
  background-color: var(--gray-9);
  border-radius: 0.5rem;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
  width: var(--sandbox-tools-width);
  max-height: 80vh;
  overflow-y: auto;
}

.accordion-root {
  width: 100%;
}

.accordion-item {
  border-bottom: 1px solid var(--gray-7);
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-header {
  display: flex;
}

.accordion-trigger {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  cursor: pointer;
  transition: color 150ms;
}

.accordion-trigger:hover {
  color: var(--gray-5);
}

.accordion-chevron {
  height: 1rem;
  width: 1rem;
  transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1);
}

.accordion-trigger[data-state='open'] .accordion-chevron {
  transform: rotate(180deg);
}

.accordion-content {
  overflow: hidden;
  font-size: 0.875rem;
}

.accordion-content[data-state='open'] {
  animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1);
}

.accordion-content[data-state='closed'] {
  animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1);
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}

.p1 {
  color: var(--green-5);
}

.p2 {
  color: var(--red-6);
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: var(--size-1);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
}

.btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background-color: var(--gray-11);
  border-radius: 0.25rem;
  text-align: left;
  transition: background-color 150ms;
}

.btn:hover:not(:disabled) {
  background-color: var(--gray-12);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 150ms;
}

.checkbox-label:hover {
  background-color: var(--gray-11);
}

.checkbox {
  cursor: pointer;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.number-input {
  width: 5rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid var(--gray-7);
  border-radius: 0.25rem;
  background-color: var(--gray-9);
}

.number-input:focus {
  outline: none;
  border-color: var(--gray-12);
}

.combobox-anchor {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.25rem;
  border: 1px solid var(--gray-7);
  padding: 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1;
  height: 38px;
  gap: 0.5rem;
  background-color: var(--gray-9);
  outline: none;
}

.combobox-anchor:focus-within {
  box-shadow: 0 0 0 2px var(--gray-12);
}

.combobox-input {
  background-color: transparent !important;
  outline: none;
  height: 100%;
  flex: 1;
}

.combobox-input::placeholder {
  color: var(--gray-9);
}

.chevron-icon {
  height: 1rem;
  width: 1rem;
  color: currentColor;
}

.combobox-content {
  z-index: 10;
  width: calc(var(--sandbox-tools-width) - 2 * var(--sandbox-tools-padding));
  margin-top: 0.25rem;
  background-color: var(--gray-9);
  border: 1px solid var(--gray-7);
  overflow: auto;
  max-height: 15rem;
  border-radius: 0.25rem;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.combobox-viewport {
  padding: 0.25rem;
}

.combobox-empty {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  padding: 0.5rem 0;
  color: var(--gray-11);
}

.combobox-item {
  font-size: 0.875rem;
  line-height: 1;
  padding: 0.5rem 0.75rem;
  position: relative;
  user-select: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.combobox-item:hover {
  background-color: var(--gray-10);
}

.position-controls {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  margin-top: var(--size-2);
}

.position-select {
  padding: 0.25rem 0.5rem;
}

.history-list {
  max-height: 10rem;
  overflow-y: auto;
  background-color: var(--gray-9);
  border-radius: 0.25rem;
  border: 1px solid var(--gray-7);
  padding: 0.5rem;
}

.history-item {
  font-size: 0.875rem;
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 150ms;
}

.history-item:hover {
  background-color: var(--gray-10);
}
</style>
