import { defaultKeyBindings } from './keybindings';

// bump this when making a breaking change to the settings shape
export const SETTINGS_VERSION = 1;

export const getDefaultSettings = () => ({
  bindings: defaultKeyBindings,
  sound: {
    musicVolume: [50],
    sfxVolume: [50]
  }
});

export type Settings = ReturnType<typeof getDefaultSettings>;
