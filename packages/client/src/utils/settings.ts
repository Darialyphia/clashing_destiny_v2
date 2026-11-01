import { defaultKeyBindings } from './keybindings';

export const getDefaultSettings = () => ({
  bindings: defaultKeyBindings,
  sound: {
    musicVolume: [50],
    sfxVolume: [50]
  }
});

export type Settings = ReturnType<typeof getDefaultSettings>;
