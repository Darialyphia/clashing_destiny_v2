<script setup lang="ts">
import { useRegister } from '../composables/useRegister';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiTextInput from '@/ui/components/UiTextInput.vue';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH
} from '@game/api';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

const { mutate: register, error, isLoading } = useRegister();

const { handleSubmit, defineField } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      email: z.string().email('Invalid email address'),
      password: z
        .string()
        .min(
          PASSWORD_MIN_LENGTH,
          `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
        )
        .max(
          PASSWORD_MAX_LENGTH,
          `Password must be at most ${PASSWORD_MAX_LENGTH} characters long`
        ),
      username: z
        .string()
        .min(
          USERNAME_MIN_LENGTH,
          `Username must be at least ${USERNAME_MIN_LENGTH} characters long`
        )
        .max(
          USERNAME_MAX_LENGTH,
          `Username must be at most ${USERNAME_MAX_LENGTH} characters long`
        )
    })
  )
});

const [email, emailProps] = defineField('email');
const [password, passwordProps] = defineField('password');
const [username, usernameProps] = defineField('username');
</script>

<template>
  <form class="surface w-80" @submit.prevent="handleSubmit(register)">
    <h2 class="text-xl font-bold">Create Account</h2>
    <div class="form-control">
      <label for="email" class="mb-1 font-medium">Email</label>
      <UiTextInput id="email" v-model="email" v-bind="emailProps" />
    </div>
    <div class="form-control">
      <label for="username" class="mb-1 font-medium">Username</label>
      <UiTextInput v-model="username" v-bind="usernameProps" />
    </div>
    <div class="form-control">
      <label for="password" class="mb-1 font-medium">Password</label>
      <UiTextInput
        id="password"
        v-model="password"
        v-bind="passwordProps"
        type="password"
      />
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
