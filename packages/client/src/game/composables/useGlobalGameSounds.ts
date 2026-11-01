import { useSoundEffect } from '@/shared/composables/useSoundEffect';
import { useFxEvent } from './useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

export const useGlobalGameSounds = () => {
  const passSound = useSoundEffect('pass');
  const effectTriggeredSound = useSoundEffect('effect-triggered');

  useFxEvent(FX_EVENTS.TURN_PASS, () => {
    passSound.value?.play();
  });
  useFxEvent(FX_EVENTS.CARD_EFFECT_TRIGGERED, () => {
    effectTriggeredSound.value?.play();
  });
  useFxEvent(FX_EVENTS.TURN_END, () => {
    passSound.value?.stop();
  });
};
