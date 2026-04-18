import type { VFXStep } from '@game/engine/src/game/systems/vfx.system';
import type { MaybePromise } from 'vee-validate';
import { useGameClient } from './useGameClient';

export const useVFXStep = <T extends VFXStep['type']>(
  name: T,
  handler: (step: VFXStep & { type: T }) => MaybePromise<void>
) => {
  const { client } = useGameClient();

  const unsub = client.value.vfx.on(name, handler as any);

  onUnmounted(unsub);

  return unsub;
};
