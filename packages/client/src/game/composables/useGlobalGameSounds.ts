import { useSoundEffect } from '@/shared/composables/useSoundEffect';
import { useFxEvent, useGameUi } from './useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

export const useGlobalGameSounds = () => {
  const ui = useGameUi();

  const passSound = useSoundEffect('pass');
  useFxEvent(FX_EVENTS.TURN_PASS, () => {
    passSound.value?.play();
  });
  useFxEvent(FX_EVENTS.TURN_END, () => {
    passSound.value?.stop();
  });

  const effectTriggeredSound = useSoundEffect('effect-triggered');
  useFxEvent(FX_EVENTS.CARD_EFFECT_TRIGGERED, () => {
    effectTriggeredSound.value?.play();
  });

  const draggingSound = useSoundEffect('dragging', {
    loop: true,
    volume: 0.5,
    fadeIn: 350
  });

  watch(
    () => ui.value.selectedCard,
    draggedCard => {
      if (draggedCard) {
        draggingSound.value?.play();
      } else {
        draggingSound.value?.stop();
      }
    }
  );

  const cancelInteractionSound = useSoundEffect('cancel-interaction-low', {
    throttle: 500
  });
  const cancelInteractionSound2 = useSoundEffect('move-card-2', {
    volume: 0.5,
    throttle: 500
  });
  useFxEvent(FX_EVENTS.CANCEL_INTERACTION, () => {
    cancelInteractionSound.value?.play();
    cancelInteractionSound2.value?.play();
  });
  useFxEvent(FX_EVENTS.CANCEL_PLAY, () => {
    cancelInteractionSound.value?.play();
    cancelInteractionSound2.value?.play();
  });
};
