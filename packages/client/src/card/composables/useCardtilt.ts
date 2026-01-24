import { ref, computed, onMounted, type MaybeRefOrGetter } from 'vue';
import { unrefElement, useEventListener } from '@vueuse/core';
import { throttle } from 'lodash-es';
import { clamp, mapRange } from '@game/shared';
import gsap from 'gsap';

export const useCardTilt = (
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: {
    maxAngle: number;
    isEnabled: Ref<boolean>;
    visiblityRoot?: Ref<HTMLElement | null | undefined>;
  }
) => {
  const x = ref(0);
  const y = ref(0);

  useEventListener(
    'mousemove',
    (e: MouseEvent) => {
      x.value = e.clientX;
      y.value = e.clientY;
    },
    { passive: true, capture: true }
  );

  const boundingRect = ref<Omit<DOMRect, 'toJSON'>>({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0
  });

  const setBoundingRect = () => {
    if (!options.isEnabled.value) return;
    const el = unrefElement(target);
    if (!el) return;
    boundingRect.value = el.getBoundingClientRect();
  };
  onMounted(setBoundingRect);

  useEventListener('scroll', throttle(setBoundingRect, 100), {
    passive: true,
    capture: true
  });

  const pointerStyle = computed(() => {
    const { left, top, width, height } = boundingRect.value;

    const pointer = {
      x: clamp(x.value - left, 0, width),
      y: clamp(y.value - top, 0, height)
    };
    const percent = {
      x: (pointer.x / width) * 100,
      y: (pointer.y / height) * 100
    };

    return {
      glareX: pointer.x,
      glareY: pointer.y,
      foilX: mapRange(percent.x, [0, 100], [0, 37.9]),
      foilY: percent.y,
      foilOilX: width - pointer.x,
      foilOilY: height - pointer.y,
      pointerFromCenter: clamp(
        Math.sqrt(
          (percent.y - 50) * (percent.y - 50) +
            (percent.x - 50) * (percent.x - 50)
        ) / 50,
        0,
        1
      )
    };
  });

  const angle = ref({
    x: 0,
    y: 0
  });

  const onMousemove = (e: MouseEvent) => {
    if (!options.isEnabled.value) return;

    const el = unrefElement(target);
    if (!el) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = boundingRect.value;
    gsap.killTweensOf(angle.value);
    gsap.to(angle.value, {
      y: ((clientX - left) / width - 0.5) * options.maxAngle,
      x: ((clientY - top) / height - 0.5) * options.maxAngle,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  const onMouseleave = () => {
    gsap.to(angle.value, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  const onMouseEnter = () => {
    setBoundingRect();
  };

  return {
    pointerStyle,
    angle,
    onMousemove,
    onMouseleave,
    onMouseEnter
  };
};
