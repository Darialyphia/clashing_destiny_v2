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

const { handleSubmit, defineField, errors } = useForm({
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

const [email, emailProps] = defineField('email', {
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false
});
const [username, usernameProps] = defineField('username', {
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false
});
const [password, passwordProps] = defineField('password');

const onSubmit = handleSubmit(async values => {
  await register(values);
});
</script>

<template>
  <form class="surface p-7" @submit.prevent="onSubmit">
    <h2 class="text-xl font-bold">Create Account</h2>
    <div class="form-control">
      <label for="email" class="mb-1 font-medium">Email</label>
      <UiTextInput id="email" v-model="email" v-bind="emailProps" />
      <p v-if="errors.email" class="text-red-500 mt-1">{{ errors.email }}</p>
    </div>
    <div class="form-control">
      <label for="username" class="mb-1 font-medium">Username</label>
      <UiTextInput v-model="username" v-bind="usernameProps" />
      <p v-if="errors.username" class="text-red-500 mt-1">
        {{ errors.username }}
      </p>
    </div>
    <div class="form-control">
      <label for="password" class="mb-1 font-medium">Password</label>
      <UiTextInput
        id="password"
        v-model="password"
        v-bind="passwordProps"
        type="password"
      />
      <p v-if="errors.password" class="text-red-500 mt-1">
        {{ errors.password }}
      </p>
    </div>

    <div class="flex gap-3 items-center">
      <p>
        Already have an account?
        <RouterLink :to="{ name: 'Login' }" class="underline color-blue-4">
          Log in.
        </RouterLink>
      </p>
      <FancyButton
        type="submit"
        :disabled="isLoading"
        class="w-full"
        :text="isLoading ? 'Loading...' : 'Submit'"
      />
    </div>

    <p v-if="error" class="text-red-500 mt-2">{{ error.message }}</p>
  </form>
</template>

<style scoped lang="postcss">
form {
  width: var(--size-sm);
}
h2 {
  font-family: 'Cinzel Decorative', serif;
  font-weight: var(--font-weight-7);
  text-align: center;
}

.form-control {
  margin-block-end: var(--size-4);
}
</style>
