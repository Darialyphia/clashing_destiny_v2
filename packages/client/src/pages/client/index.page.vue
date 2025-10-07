<script setup lang="ts">
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';

definePage({
  name: 'ClientHome',
  meta: {
    requiresAuth: true
  }
});
</script>

<template>
  <div class="client-home-page">
    <AuthenticatedHeader />
  </div>
</template>
