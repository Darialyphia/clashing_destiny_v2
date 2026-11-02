import { useSoundEffect } from '@/shared/composables/useSoundEffect';
import { useFxEvent } from './useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

export const useGlobalGameSounds = () => {
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
