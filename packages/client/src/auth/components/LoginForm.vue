<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import UiTextInput from '@/ui/components/UiTextInput.vue';
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

const onSubmit = handleSubmit(async values => {
  await login(values);
});
</script>

<template>
  <form class="surface p-7" @submit.prevent="onSubmit">
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
    <div class="flex items-center justify-between">
      <RouterLink :to="{ name: 'Register' }" class="underline color-blue-4">
        I don't have an account
      </RouterLink>
      <FancyButton
        type="submit"
        :disabled="isLoading"
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
