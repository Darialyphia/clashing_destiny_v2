import { onBeforeUnmount, onMounted, type Ref } from 'vue';
import gsap from 'gsap';
import * as PIXI from 'pixi.js';

export function useBoosterPixiEffects(
  canvasContainerRef: Ref<HTMLElement | null>
) {
  let pixiApp: PIXI.Application | null = null;

  const initPixi = () => {
    if (!canvasContainerRef.value || pixiApp) return;

    pixiApp = new PIXI.Application({
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true
    });

    canvasContainerRef.value.appendChild(pixiApp.view as unknown as Node);
  };

  onMounted(initPixi);

  onBeforeUnmount(() => {
    if (pixiApp) {
      pixiApp.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true
      });
      pixiApp = null;
    }
  });

  const createParticleTexture = () => {
    if (!pixiApp) return null;

    const gfx = new PIXI.Graphics();
    gfx.beginFill(0xffffff);
    gfx.drawCircle(0, 0, 10);
    gfx.endFill();
    return pixiApp.renderer.generateTexture(gfx);
  };

  const triggerPixiExplosion = (x: number, y: number) => {
    if (!pixiApp) return;

    const container = new PIXI.Container();
    pixiApp.stage.addChild(container);

    const ring = new PIXI.Graphics();
    ring.lineStyle(5, 0xffd700, 1);
    ring.drawCircle(0, 0, 100);
    ring.position.set(x, y);
    ring.scale.set(0);
    container.addChild(ring);

    gsap.to(ring.scale, { x: 5, y: 5, duration: 1, ease: 'power2.out' });
    gsap.to(ring, { alpha: 0, duration: 1, ease: 'power2.out' });

    const texture = createParticleTexture();
    if (texture) {
      const particleCount = 200;
      for (let i = 0; i < particleCount; i += 1) {
        const sprite = new PIXI.Sprite(texture);
        sprite.x = x;
        sprite.y = y;
        sprite.anchor.set(0.5);
        sprite.tint = Math.random() < 0.5 ? 0xffd700 : 0xff4500;
        sprite.scale.set(Math.random() * 0.5 + 0.2);

        const angle = Math.random() * Math.PI * 2;
        container.addChild(sprite);

        gsap.to(sprite, {
          x: x + Math.cos(angle) * (300 + Math.random() * 200),
          y: y + Math.sin(angle) * (300 + Math.random() * 200),
          alpha: 0,
          duration: 1 + Math.random(),
          ease: 'power2.out'
        });
      }
    }

    setTimeout(() => {
      container.destroy({ children: true });
    }, 2000);
  };

  return {
    triggerPixiExplosion
  };
}
