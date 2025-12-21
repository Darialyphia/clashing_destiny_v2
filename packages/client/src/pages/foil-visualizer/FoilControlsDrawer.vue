<script setup lang="ts">
import UiDrawer from '@/ui/components/UiDrawer.vue';
import UiSwitch from '@/ui/components/UiSwitch.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';

const isOpened = defineModel<boolean>('isOpened', { required: true });

const { foilOptions } = defineProps<{
  foilOptions: Partial<CardBlueprint['art'][string]['foil']>;
}>();

const emit = defineEmits<{
  'update:foilOption': [key: string, value: boolean | undefined];
}>();

const updateOption = (
  key: keyof typeof foilOptions,
  value: boolean | undefined
) => {
  emit('update:foilOption', key, value);
};
</script>

<template>
  <UiDrawer
    v-model:is-opened="isOpened"
    title="Foil Effects"
    position="right"
    :style="{ '--ui-drawer-size': '320px' }"
  >
    <div class="drawer-inner">
      <div class="drawer-header">
        <h2>Foil Effects</h2>
      </div>
      <div class="foil-controls">
        <label class="control-item">
          <UiSwitch
            :model-value="foilOptions.foilLayer"
            @update:model-value="updateOption('foilLayer', $event)"
          />
          <span>Foil art</span>
        </label>
        <label class="control-item">
          <UiSwitch
            :model-value="foilOptions.sheen"
            @update:model-value="updateOption('sheen', $event)"
          />
          <span>Sheen</span>
        </label>
        <label class="control-item">
          <UiSwitch
            :model-value="foilOptions.oil"
            @update:model-value="updateOption('oil', $event)"
          />
          <span>Oil</span>
        </label>
        <label class="control-item">
          <UiSwitch
            :model-value="foilOptions.gradient"
            @update:model-value="updateOption('gradient', $event)"
          />
          <span>Gradient</span>
        </label>
        <label class="control-item">
          <UiSwitch
            :model-value="foilOptions.lightGradient"
            @update:model-value="updateOption('lightGradient', $event)"
          />
          <span>Light Gradient</span>
        </label>
        <label class="control-item">
          <UiSwitch
            :model-value="foilOptions.scanlines"
            @update:model-value="updateOption('scanlines', $event)"
          />
          <span>Scanlines</span>
        </label>
        <label class="control-item">
          <UiSwitch
            :model-value="foilOptions.goldenGlare"
            @update:model-value="updateOption('goldenGlare', $event)"
          />
          <span>Golden Glare</span>
        </label>
        <label class="control-item">
          <UiSwitch
            :model-value="foilOptions.glitter"
            @update:model-value="updateOption('glitter', $event)"
          />
          <span>Glitter</span>
        </label>
      </div>
    </div>
  </UiDrawer>
</template>

<style scoped lang="postcss">
.drawer-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-2);
  color: var(--text-1);
}

.drawer-header {
  padding: var(--size-4);
  border-bottom: 1px solid var(--surface-3);
}

.drawer-header h2 {
  margin: 0;
  font-size: var(--font-size-4);
}

.foil-controls {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
  padding: var(--size-4);
}

.control-item {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  cursor: pointer;
  padding: var(--size-2);
  border-radius: var(--radius-2);
  transition: background 0.2s ease;
}

.control-item:hover {
  background: var(--surface-3);
}

.control-item span {
  font-size: var(--font-size-2);
  user-select: none;
}
</style>
