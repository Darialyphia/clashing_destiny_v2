<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import UnauthenticatedHeader from '@/UnauthenticatedHeader.vue';

definePage({
  name: 'Home',
  path: '/'
});
</script>

<template>
  <div class="home-page">
    <UnauthenticatedHeader />
    <main>
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div>
            <h1 class="hero-title">Clashing Destinies</h1>
            <p class="hero-tagline">
              Forge Your Legend in Strategic Card Combat
            </p>
            <p class="hero-description">
              Master the art of tactical warfare in this immersive fantasy card
              game. Build your destiny deck, command powerful heroes, and clash
              against opponents in epic duels where every decision shapes your
              fate.
            </p>
            <div class="hero-actions">
              <RouterLink :to="{ name: 'Register' }">
                <FancyButton text="Begin Your Journey" variant="info" />
              </RouterLink>
              <RouterLink :to="{ name: 'Login' }">
                <FancyButton text="Return to Battle" variant="primary" />
              </RouterLink>
            </div>
          </div>
          <div class="hero-visual">
            <div class="floating-cards">
              <div class="card-phantom card-1"></div>
              <div class="card-phantom card-2"></div>
              <div class="card-phantom card-3"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="container">
          <h2 class="section-title">Master the Elements of War</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">⚔️</div>
              <h3>Strategic Combat</h3>
              <p>
                Engage in intense PvP battles where tactical thinking and card
                mastery determine victory.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🃏</div>
              <h3>Destiny Decks</h3>
              <p>
                Build powerful decks with unique 12-card Destiny collections
                that unlock hidden strategies.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🧙‍♂️</div>
              <h3>Legendary Heroes</h3>
              <p>
                Command mighty heroes with evolving abilities as they level up
                throughout each battle.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔮</div>
              <h3>Arcane Spells</h3>
              <p>
                Wield devastating magic and artifacts to turn the tide of battle
                in your favor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Claim Your Destiny?</h2>
            <p>
              Join thousands of strategists in the ultimate fantasy card game
              experience.
            </p>
            <RouterLink :to="{ name: 'Register' }" class="cta-large">
              Start Playing Now
            </RouterLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="postcss">
/* Hero Section */
.hero-section {
  min-height: 80vh;
  background: linear-gradient(
    135deg,
    hsl(240 100% 5%) 0%,
    hsl(250 80% 8%) 25%,
    hsl(260 60% 12%) 50%,
    hsl(240 80% 8%) 75%,
    hsl(240 100% 5%) 100%
  );
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--size-8) var(--size-4);
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(
      circle at 20% 80%,
      hsl(270 100% 20% / 0.3) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      hsl(300 100% 15% / 0.4) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%,
      hsl(240 100% 10% / 0.2) 0%,
      transparent 50%
    );
  z-index: 1;
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

.hero-title {
  font-family: 'Cinzel Decorative', serif;
  font-weight: var(--font-weight-7);
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: var(--size-4);
  color: transparent;
  background-image: linear-gradient(
    45deg,
    #efef9f,
    #efef9f 30%,
    #d7ad42 70%,
    #b8941f
  );
  background-clip: text;
  text-shadow: 3px 5px 15px hsl(from cyan h s l / 0.4);
  line-height: 1.2;
}

.hero-tagline {
  font-size: 1.5rem;
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-6);
  color: #c9c9c9;
  text-shadow: 2px 2px 8px hsl(240 100% 5% / 0.8);
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: var(--size-8);
  color: #a8a8a8;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: var(--size-4);
  flex-wrap: wrap;
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

.card-phantom {
  position: absolute;
  width: 120px;
  height: 180px;
  background: linear-gradient(
    135deg,
    hsl(240 50% 15%) 0%,
    hsl(250 40% 20%) 50%,
    hsl(240 50% 15%) 100%
  );
  border: 2px solid #d7ad42;
  border-radius: var(--radius-3);
  box-shadow:
    0 8px 25px hsl(240 100% 5% / 0.8),
    inset 0 1px 3px hsl(45 100% 50% / 0.2);
  animation: float 6s ease-in-out infinite;
}

.card-phantom::before {
  content: '';
  position: absolute;
  inset: 8px;
  background: linear-gradient(
    45deg,
    transparent 30%,
    hsl(45 100% 50% / 0.1) 50%,
    transparent 70%
  );
  border-radius: var(--radius-2);
}

.card-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
  transform: rotate(-15deg);
}

.card-2 {
  top: 40%;
  right: 20%;
  animation-delay: 2s;
  transform: rotate(10deg);
}

.card-3 {
  bottom: 20%;
  left: 40%;
  animation-delay: 4s;
  transform: rotate(-5deg);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(var(--rotation, 0deg));
  }
  50% {
    transform: translateY(-20px) rotate(var(--rotation, 0deg));
  }
}

/* Features Section */
.features-section {
  padding: var(--size-10) var(--size-4);
  background: linear-gradient(
    180deg,
    hsl(240 20% 8%) 0%,
    hsl(245 25% 12%) 100%
  );
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: 2.5rem;
  font-weight: var(--font-weight-7);
  text-align: center;
  margin-bottom: var(--size-12);
  color: transparent;
  background-image: linear-gradient(45deg, #efef9f, #d7ad42);
  background-clip: text;
  text-shadow: 2px 4px 8px hsl(240 100% 5% / 0.5);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--size-8);
}

.feature-card {
  background: linear-gradient(
    135deg,
    hsl(240 30% 10%) 0%,
    hsl(245 25% 15%) 100%
  );
  padding: var(--size-8);
  border-radius: var(--radius-4);
  border: 1px solid hsl(45 50% 30% / 0.3);
  text-align: center;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px hsl(240 100% 5% / 0.5);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: var(--size-4);
  filter: drop-shadow(0 2px 4px hsl(240 100% 5% / 0.8));
}

.feature-card h3 {
  font-family: 'Cinzel Decorative', serif;
  font-size: 1.5rem;
  font-weight: var(--font-weight-6);
  color: #efef9f;
  margin-bottom: var(--size-4);
}

.feature-card p {
  color: #a8a8a8;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: var(--size-10) var(--size-4);
  background: linear-gradient(
    135deg,
    hsl(240 100% 5%) 0%,
    hsl(250 80% 8%) 50%,
    hsl(240 100% 5%) 100%
  );
  text-align: center;
}

.cta-content h2 {
  font-family: 'Cinzel Decorative', serif;
  font-size: 2.5rem;
  font-weight: var(--font-weight-7);
  color: transparent;
  background-image: linear-gradient(45deg, #efef9f, #d7ad42);
  background-clip: text;
  margin-bottom: var(--size-4);
}

.cta-content p {
  font-size: 1.2rem;
  color: #c9c9c9;
  margin-bottom: var(--size-8);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-large {
  display: inline-block;
  padding: var(--size-5) var(--size-8);
  background: linear-gradient(45deg, #d7ad42, #efef9f);
  color: hsl(240 100% 5%);
  font-size: 1.3rem;
  font-weight: var(--font-weight-7);
  text-decoration: none;
  border-radius: var(--radius-4);
  box-shadow: 0 6px 20px hsl(45 100% 50% / 0.4);
  transition: all 0.3s ease;
}

.cta-large:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px hsl(45 100% 50% / 0.5);
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

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
