<script setup lang="ts">
import LoginForm from '@/auth/components/LoginForm.vue';
import UnauthenticatedHeader from '@/UnauthenticatedHeader.vue';

definePage({
  name: 'Login',
  path: '/login',
  meta: { publicOnly: true }
});
</script>

<template>
  <div class="login-page">
    <UnauthenticatedHeader />
    <LoginForm class="login-form" />
  </div>
</template>

<style lang="postcss" scoped>
.login-page {
  height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr;
}
.login-form {
  place-self: center;
}
</style>
