<script setup lang="ts">
import Sound from './Sound.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useRoute, type RouterLinkProps } from 'vue-router';

const { to } = defineProps<{
  to?: RouterLinkProps['to'];
}>();
const route = useRoute();
</script>

<template>
  <div class="back-button">
    <Sound sound="whoosh" :triggers="['mousedown']">
      <Sound
        sound="card-hover"
        :triggers="['mouseenter']"
        :volume="0.4"
        :hoverDelay="150"
      >
        <FancyButton
          text="Back"
          size="md"
          :to="to ?? { name: (route.query.from as any) ?? 'ClientHome' }"
        />
      </Sound>
    </Sound>
  </div>
</template>

<style scoped lang="postcss"></style>
