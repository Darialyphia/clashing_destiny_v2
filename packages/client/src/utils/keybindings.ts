import type { Control } from '@/shared/composables/useKeyboardControl';

export const keyBindingsLabels = {
  openSettings: 'Open settings',
  toggleDiscardPile: 'Shows / hides the discard pile',
  toggleOpponentDiscardPile: "Shows / hides your opponent's discard pile",
  toggleBanishPile: 'Shows / hides the banish pile',
  toggleOpponentBanishPile: "Shows / hides your opponent's banish pile",
  pass: 'Pass'
} satisfies Record<keyof typeof defaultKeyBindings, string>;

export const defaultKeyBindings = {
  toggleDiscardPile: {
    control: { key: 'KeyD', modifier: null }
  },
  toggleOpponentDiscardPile: {
    control: { key: 'KeyD', modifier: 'shift' }
  },
  toggleBanishPile: {
    control: { key: 'KeyF', modifier: null }
  },
  toggleOpponentBanishPile: {
    control: { key: 'KeyF', modifier: 'shift' }
  },
  pass: {
    control: { key: 'KeyP', modifier: null }
  },
  openSettings: {
    control: { key: 'Escape', modifier: null }
  }
} as const satisfies Record<string, { control: Control }>;
