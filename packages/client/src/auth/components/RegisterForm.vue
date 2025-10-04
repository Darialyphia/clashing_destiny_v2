<script setup lang="ts">
import { ref } from 'vue';
import { useRegister } from '../composables/useRegister';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiTextInput from '@/ui/components/UiTextInput.vue';

const email = ref('');
const password = ref('');

const { mutate: register, error, isLoading } = useRegister();
</script>

<template>
  <form @submit.prevent="register({ email, password })" class="surface w-80">
    <h2 class="text-xl font-bold">Create Account</h2>
    <div class="form-control">
      <label for="email" class="mb-1 font-medium">Email</label>
      <UiTextInput v-model="email" type="email" id="email" required />
    </div>
    <div class="form-control">
      <label for="password" class="mb-1 font-medium">Password</label>
      <UiTextInput v-model="password" type="password" id="password" required />
    </div>

    <FancyButton
      type="submit"
      :disabled="isLoading"
      class="w-full"
      :text="isLoading ? 'Loading...' : 'Submit'"
    />

    <p v-if="error" class="text-red-500 mt-2">{{ error.message }}</p>
  </form>
</template>

<style scoped lang="postcss">
h2 {
  font-family: 'Cinzel Decorative', serif;
  font-weight: var(--font-weight-7);
}

.form-control {
  margin-block-end: var(--size-4);
}
</style>
