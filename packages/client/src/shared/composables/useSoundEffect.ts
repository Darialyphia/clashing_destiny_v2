import { Howl } from 'howler';
import { useUserSettings } from './useUserSettings';
import { isDefined } from '@game/shared';
import { assets } from '@/assets';

const soundCache = new Map<string, Howl>();
const getShoundInstance = (id: string) => {
  if (soundCache.has(id)) {
    return soundCache.get(id);
  }
  const newHowl = new Howl({
    src: [assets[`sfx/${id}`].path]
  });
  soundCache.set(id, newHowl);
  return newHowl;
};

// shared across every useSoundEffect call so the throttle applies per sound id, not per component
const lastPlayedAt = new Map<string, number>();

export type SoundEffectOptions = {
  /** randomizes the playback rate by +/- this amount on every play, e.g. 0.05 => between 0.95 and 1.05 */
  rateVariance?: number;
  /** minimum delay in ms between two plays of the same sound id */
  throttle?: number;
};

export const useSoundEffect = (
  sound: MaybeRef<string | undefined>,
  options: SoundEffectOptions = {}
) => {
  const SCALE_FACTOR = 0.8;
  const { settings: userSettings } = useUserSettings();

  const howl = ref() as Ref<Howl | undefined>;

  const setVolume = (volume: number) => {
    howl.value?.volume(volume * SCALE_FACTOR);
  };

  const play = () => {
    const id = unref(sound);
    const instance = howl.value;
    if (!isDefined(id) || !instance) return;

    if (options.throttle) {
      const now = performance.now();
      const lastPlayed = lastPlayedAt.get(id);
      if (isDefined(lastPlayed) && now - lastPlayed < options.throttle) return;
      lastPlayedAt.set(id, now);
    }

    const playbackId = instance.play();
    if (options.rateVariance) {
      // the Howl instance is shared, so the rate must be set for this playback id only.
      // Calling rate() without an id would also change the sounds that are currently playing
      const rate = 1 + (Math.random() * 2 - 1) * options.rateVariance;
      instance.rate(rate, playbackId);
    }

    return playbackId;
  };

  const soundEffect = computed(() =>
    howl.value ? { play, stop: () => howl.value?.stop() } : undefined
  );

  watchEffect(() => {
    const id = unref(sound);
    if (!isDefined(id)) return;
    howl.value = getShoundInstance(id);
    setVolume(userSettings.value.sound.sfxVolume[0] / 100);
  });

  watchEffect(() => {
    setVolume(userSettings.value.sound.sfxVolume[0] / 100);
  });

  return soundEffect;
};
