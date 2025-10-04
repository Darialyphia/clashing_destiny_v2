<script setup lang="ts">
import RegisterForm from '@/auth/components/RegisterForm.vue';
import UnauthenticatedHeader from '@/UnauthenticatedHeader.vue';

definePage({
  name: 'Register',
  path: '/register',
  meta: { publicOnly: true }
});
</script>

<template>
  <div class="register-page">
    <UnauthenticatedHeader />
    <RegisterForm class="register-form" />
  </div>
</template>

<style lang="postcss" scoped>
.register-page {
  height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr;
}
.register-form {
  place-self: center;
}
</style>
