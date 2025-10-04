<script setup lang="ts">
const { placeholder, type = 'text' } = defineProps<{
  placeholder?: string;
  type?: string;
}>();

const modelValue = defineModel<string | undefined>({ required: true });

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  modelValue.value = target.value;
};
</script>

<template>
  <input
    v-model="modelValue"
    :type="type"
    :placeholder="placeholder"
    class="p-2 border rounded w-full"
    @input="onInput"
  />
</template>

<style scoped lang="postcss">
input {
  border-image-slice: 16 fill;
  border-image-width: 16px;
  color: black;
  -webkit-text-fill-color: black;
  padding: var(--size-2);
  border-image-source: url('/assets/ui/text-input.png');
  background: transparent;
}
</style>
