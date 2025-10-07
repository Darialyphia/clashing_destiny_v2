<script setup lang="ts">
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
</script>

<template>
  <section class="hero-section">
    <div class="hero-content">
      <div>
        <h1>Clashing Destinies</h1>
        <p class="hero-tagline">Forge Your Legend in Strategic Card Combat</p>
        <p class="hero-description">
          Master the art of tactical warfare in this immersive fantasy card
          game. Build your destiny deck, command powerful heroes, and clash
          against opponents in epic duels where every decision shapes your fate.
        </p>
        <div class="hero-actions">
          <RouterLink :to="{ name: 'Register' }">
            <FancyButton text="Play Free" variant="info" class="cta" />
          </RouterLink>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-cards">
          <div class="card-phantom card-4">
            <BlueprintCard :blueprint="CARDS_DICTIONARY['fireball']" is-foil />
          </div>
          <div class="card-phantom card-5">
            <BlueprintCard
              :blueprint="CARDS_DICTIONARY['gaze-into-tomorrow']"
              is-foil
            />
          </div>
          <div class="card-phantom card-1">
            <BlueprintCard :blueprint="CARDS_DICTIONARY['phoenix']" is-foil />
          </div>
          <div class="card-phantom card-2">
            <BlueprintCard
              :blueprint="CARDS_DICTIONARY['royal-guard']"
              is-foil
            />
          </div>
          <div class="card-phantom card-3">
            <BlueprintCard :blueprint="CARDS_DICTIONARY['aiden-lv2']" is-foil />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="postcss">
.hero-section {
  background-attachment: fixed;
  background:
    linear-gradient(to top, hsl(0 0% 0% / 0.8) 20%, transparent 80%),
    url('/assets/backgrounds/home_hero.jpg');
  background-size: cover;
  background-position: center, center, bottom;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--size-13) var(--size-4) var(--size-10);
}

.hero-content {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  position: relative;
  z-index: 2;
  color: #efef9f;
}

h1 {
  font-family: 'Cinzel Decorative', serif;
  font-weight: var(--font-weight-9);
  font-size: var(--font-size-7);
  margin-bottom: var(--size-4);
  color: transparent;
  background-image: linear-gradient(#efef9f, #efef9f 50%, #d7ad42 50%);
  background-clip: text;
  position: relative;
  &::after {
    content: 'Clashing Destinies';
    position: absolute;
    inset: 0;
    color: transparent;
    -webkit-text-stroke: 4px black;
    z-index: -1;
    text-shadow: 0 0 10px black;
  }
}

.cta {
  padding: var(--size-6) var(--size-5);
}

.hero-tagline {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-6);
  color: #c9c9c9;
  text-shadow: 2px 2px 8px hsl(240 100% 5% / 0.8);
}

.hero-description {
  font-size: var(--font-size-2);
  line-height: 1.6;
  margin-bottom: var(--size-8);
  color: #b8b8b8;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  justify-content: flex-end;
  padding-inline-end: var(--size-7);
}

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-cards {
  position: relative;
  width: 100%;
  height: 100%;
}

@keyframes landing-card {
  0% {
    top: 50%;
    left: 50%;
    scale: 0.5;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
.card-phantom {
  position: absolute;
  --pixel-size: 2;
  box-shadow:
    0 8px 25px hsl(240 100% 5% / 0.8),
    inset 0 1px 3px hsl(45 100% 50% / 0.2);
  animation: landing-card 0.8s var(--ease-elastic-in-out-4);
}

.card-1 {
  top: 10%;
  left: 20%;
  rotate: -5deg;
}

.card-2 {
  top: 30%;
  right: -25%;
  rotate: 10deg;
}

.card-3 {
  top: -30%;
  left: 50%;
}

.card-4 {
  --pixel-scale: 1;
  top: -35%;
  left: 90%;
  rotate: 20deg;
}

.card-5 {
  --pixel-scale: 1;
  top: -25%;
  right: 55%;
  rotate: -24deg;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--size-8);
  }

  .hero-visual {
    height: 250px;
  }

  .hero-actions {
    justify-content: center;
  }

  .card-phantom {
    width: 80px;
    height: 120px;
  }
}
</style>
