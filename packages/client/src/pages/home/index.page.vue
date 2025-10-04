<script setup lang="ts">
import UnauthenticatedHeader from '@/UnauthenticatedHeader.vue';
import HeroSection from './HeroSection.vue';
import FeaturesSection from './FeaturesSection.vue';
import CallToActionSection from './CallToActionSection.vue';

definePage({
  name: 'Home',
  path: '/'
});
</script>

<template>
  <div class="home-page">
    <UnauthenticatedHeader />
    <main>
      <HeroSection />
      <FeaturesSection />
      <CallToActionSection />
    </main>
  </div>
</template>
