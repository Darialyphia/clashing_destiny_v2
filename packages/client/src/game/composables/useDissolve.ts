const setRandomSeed = () => {
  const turbulence = document.getElementById('dissolve-filter-turbulence')!;
  console.log('turbulence', turbulence);
  turbulence.setAttribute('seed', `${Math.random() * 1000}`);
};

const easeOutCubic = (t: number) => {
  return 1 - Math.pow(1 - t, 3);
};

const maxDisplacementScale = 300;

export const useDissolveVFX = () => {
  return {
    play(element: HTMLElement, duration: number) {
      if (element.getAttribute('data-dissolve') === 'true') return;

      const displacement = document.getElementById(
        'dissolve-filter-displacement'
      )!;
      setRandomSeed();
      element.style.filter = 'url(#dissolve-filter)';

      const startTime = performance.now();
      element.setAttribute('data-dissolve', 'true');

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const displacementScale = easeOutCubic(progress) * maxDisplacementScale;

        displacement.setAttribute('scale', `${displacementScale}`);
        element.style.transform = `scale(${1 + 0.1 * progress})`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          displacement.setAttribute('scale', '0');
          element.remove();
        }
      };

      requestAnimationFrame(animate);
    }
  };
};
