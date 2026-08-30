<script setup lang="ts"></script>

<template>
  <div class="foil foil-bright-shine"></div>
</template>

<style scoped lang="postcss">
.foil {
}

.foil-bright-shine {
  position: absolute;
  mix-blend-mode: color-dodge;
  transition: opacity 0.3s ease-in-out;
  inset: 0;
  opacity: 0;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      conic-gradient(
        from 0deg at var(--foil-oil-x) var(--foil-oil-y),
        #ff7 0deg,
        #a8ff5f 60deg,
        #83fff7 120deg,
        #7894ff 180deg,
        #d875ff 240deg,
        #ff7773 300deg,
        #ff7 360deg
      ),
      radial-gradient(
        farthest-corner circle at var(--glare-x) var(--glare-y),
        hsla(0, 0%, 95%, 0.98) 10%,
        hsla(177, 22%, 80%, 0.1) 20%,
        hsla(150, 20%, 10%, 1) 90%
      );

    background-size:
      cover,
      20% 20%;
    background-position:
      center center,
      55% 55%;
    background-blend-mode: soft-light;
    /* mask-image: repeating-radial-gradient(
      circle,
      transparent 0px 15px,
      black 25px 40px,
      transparent 40px 55px
    ); */
    /* mix-blend-mode: screen; */
    /* background-size: 500%;
    background-repeat: no-repeat;
    background-position: var(--foil-x) var(--foil-y);
    mix-blend-mode: difference; */
  }
}

:global(:is(.card-perspective-wrapper, .small-card):hover .foil-bright-shine) {
  opacity: 0.6;
  transition-delay: 0.3s;
}
</style>
