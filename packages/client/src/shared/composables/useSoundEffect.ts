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
  /** multiplier applied on top of the volume computed from the user settings */
  volume?: number;
  /** if true, play() loops the sound until stop() is called (or the calling scope is disposed) */
  loop?: boolean;
  /** duration in ms of a fade in from silence when the sound starts. With loop, only the first iteration fades in */
  fadeIn?: number;
};

export const useSoundEffect = (
  sound: MaybeRef<string | undefined>,
  options: SoundEffectOptions = {}
) => {
  const SCALE_FACTOR = 0.8;
  const { settings: userSettings } = useUserSettings();

  const howl = ref() as Ref<Howl | undefined>;

  const getVolume = () =>
    Math.min(
      1,
      (userSettings.value.sound.sfxVolume[0] / 100) *
        SCALE_FACTOR *
        (options.volume ?? 1)
    );

  let activeLoop: { howl: Howl; playbackId: number } | null = null;

  const play = () => {
    const id = unref(sound);
    const instance = howl.value;
    if (!isDefined(id) || !instance) return;

    // a loop only ends on stop(), so playing again would stack a second loop on top of the first
    if (activeLoop) return activeLoop.playbackId;

    if (options.throttle) {
      const now = performance.now();
      const lastPlayed = lastPlayedAt.get(id);
      if (isDefined(lastPlayed) && now - lastPlayed < options.throttle) return;
      lastPlayedAt.set(id, now);
    }

    const playbackId = instance.play();

    // the Howl instance is shared, so volume and rate must be set for this playback id only.
    // Calling them without an id would also change the sounds that are currently playing
    if (options.fadeIn) {
      // fade() sets the start volume itself. A looping playback repeats inside the same playback id,
      // so the fade only runs when the sound starts, not on every loop
      instance.fade(0, getVolume(), options.fadeIn, playbackId);
    } else {
      instance.volume(getVolume(), playbackId);
    }

    if (options.rateVariance) {
      const rate = 1 + (Math.random() * 2 - 1) * options.rateVariance;
      instance.rate(rate, playbackId);
    }

    if (options.loop) {
      instance.loop(true, playbackId);
      activeLoop = { howl: instance, playbackId };
      instance.once(
        'stop',
        () => {
          activeLoop = null;
        },
        playbackId
      );
    }

    return playbackId;
  };

  const soundEffect = computed(() => {
    if (!howl.value) return;
    return {
      play,
      stop: () => howl.value?.stop(),
      onDone: (callback: () => void) => {
        if (!howl.value) return;
        howl.value.once('end', callback);
      }
    };
  });

  watchEffect(() => {
    const id = unref(sound);
    if (!isDefined(id)) return;
    howl.value = getShoundInstance(id);
  });

  // keep a running loop in sync with the volume setting
  watchEffect(() => {
    const volume = getVolume();
    activeLoop?.howl.volume(volume, activeLoop.playbackId);
  });

  if (options.loop) {
    onScopeDispose(() => {
      activeLoop?.howl.stop(activeLoop.playbackId);
    });
  }

  return soundEffect;
};
