import type { Control } from '@/shared/composables/useKeyboardControl';

export const defaultKeyBindings = {
  showHand: {
    label: 'Shows / hides your hand',
    control: { key: 'KeyC', modifier: null }
  },
  toggleDiscardPile: {
    label: 'Shows / hides the discard pile',
    control: { key: 'KeyD', modifier: null }
  },
  toggleOpponentDiscardPile: {
    label: "Shows / hides your opponent's discard pile",
    control: { key: 'KeyD', modifier: 'shift' }
  },
  toggleBanishPile: {
    label: 'Shows / hides the banish pile',
    control: { key: 'KeyF', modifier: null }
  },
  toggleOpponentBanishPile: {
    label: "Shows / hides your opponent's banish pile",
    control: { key: 'KeyF', modifier: 'shift' }
  },
  toggleDestinyDeck: {
    label: 'Shows / hides the destiny deck',
    control: { key: 'KeyG', modifier: null }
  },
  pass: {
    label: 'Pass',
    control: { key: 'KeyP', modifier: null }
  },
  showFullCardText: {
    label: 'Show full card text when hovering cards',
    control: { key: 'ShiftLeft', modifier: null }
  },
  openSettings: {
    label: 'Open settings',
    control: { key: 'Escape', modifier: null }
  }
} as const satisfies Record<string, { label: string; control: Control }>;
