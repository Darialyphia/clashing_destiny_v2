<template>
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
            Build powerful decks with unique 12-card Destiny collections that
            unlock hidden strategies.
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
            Wield devastating magic and artifacts to turn the tide of battle in
            your favor.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="postcss">
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

/* Responsive Design */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
