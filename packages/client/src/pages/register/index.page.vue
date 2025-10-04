<script setup lang="ts">
import RegisterForm from '@/auth/components/RegisterForm.vue';

definePage({
  name: 'Register',
  path: '/register'
});
</script>

<template>
  <div class="register-page">
    <RegisterForm />
  </div>
</template>

<style lang="postcss" scoped></style>
