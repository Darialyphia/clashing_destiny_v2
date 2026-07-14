import { ref, type Ref, type MaybeRefOrGetter } from 'vue';
import { until, useResizeObserver, unrefElement } from '@vueuse/core';

export function useAutoResizeText(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: { min: number; max: number; ideal: number }
) {
  const fontSize = ref(options.max);

  const setVariableFontSize = (box: HTMLElement, sizeRef: Ref<number>) => {
    const inner = box.firstChild as HTMLElement;
    const outerHeight = box.clientHeight;

    let innerHeight = inner.clientHeight;
    if (innerHeight > outerHeight) {
      while (innerHeight > outerHeight) {
        sizeRef.value -= 0.5;
        box.style.fontSize = `${sizeRef.value}px`;

        innerHeight = inner.clientHeight;

        if (sizeRef.value <= options.min) {
          box.style.fontSize = '';
          break;
        }
      }
    } else if (innerHeight < outerHeight && sizeRef.value < options.ideal) {
      while (innerHeight < outerHeight) {
        sizeRef.value += 0.5;
        box.style.fontSize = `${sizeRef.value}px`;

        innerHeight = inner.clientHeight;

        if (sizeRef.value >= options.max) {
          box.style.fontSize = '';
          break;
        }
      }
    }
  };

  until(() => unrefElement(target))
    .toBeTruthy()
    .then(el => {
      const box = el as HTMLElement;
      setVariableFontSize(box, fontSize);

      const child = box.firstChild as HTMLElement;
      if (child) {
        useResizeObserver(child, () => {
          setVariableFontSize(box, fontSize);
        });
      }
    });

  return {
    fontSize
  };
}
