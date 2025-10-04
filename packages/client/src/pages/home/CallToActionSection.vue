<template>
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
</template>

<style scoped lang="postcss">
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

.container {
  max-width: 1200px;
  margin: 0 auto;
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
</style>
