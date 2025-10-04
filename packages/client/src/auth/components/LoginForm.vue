<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { useLogin } from '../composables/useLogin';

const { mutate: login, error, isLoading } = useLogin();

const { handleSubmit, defineField } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      email: z.string().email('Invalid email address'),
      password: z.string()
    })
  )
});

const [email, emailProps] = defineField('email');
const [password, passwordProps] = defineField('password');
</script>

<template>
  <form @submit.prevent="handleSubmit(login)">
    <h2 class="text-xl font-bold">Login</h2>

    <div class="form-control">
      <label for="email" class="mb-1 font-medium">Email</label>
      <UiTextInput id="email" v-model="email" v-bind="emailProps" />
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
    <FancyButton type="submit" :disabled="isLoading">
      <span v-if="isLoading">Loading...</span>
      <span v-else>Submit</span>
    </FancyButton>
    <p v-if="error" class="text-red-500 mt-2">{{ error.message }}</p>
  </form>
</template>

<style lang="postcss" scoped></style>
