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
  interactHero: {
    label: 'Select your hero',
    control: { key: 'KeyH', modifier: null }
  },
  interactCardInHand1: {
    label: 'Play / select the 1st card in your hand',
    control: { key: 'Digit1', modifier: null }
  },
  interactCardInHand2: {
    label: 'Play / select the 2nd card in your hand',
    control: { key: 'Digit2', modifier: null }
  },
  interactCardInHand3: {
    label: 'Play / select the 3rd card in your hand',
    control: { key: 'Digit3', modifier: null }
  },
  interactCardInHand4: {
    label: 'Play / select the 4th card in your hand',
    control: { key: 'Digit4', modifier: null }
  },
  interactCardInHand5: {
    label: 'Play / select the 5th card in your hand',
    control: { key: 'Digit5', modifier: null }
  },
  interactCardInHand6: {
    label: 'Play / select the 6th card in your hand',
    control: { key: 'Digit6', modifier: null }
  },
  interactCardInHand7: {
    label: 'Play / select the 7th card in your hand',
    control: { key: 'Digit7', modifier: null }
  },
  interactCardInHand8: {
    label: 'Play / select the 8th card in your hand',
    control: { key: 'Digit8', modifier: null }
  },
  interactCardInHand9: {
    label: 'Play / select the 9th card in your hand',
    control: { key: 'Digit9', modifier: null }
  },
  pass: {
    label: 'Pass',
    control: { key: 'KeyP', modifier: null }
  }
} as const satisfies Record<string, { label: string; control: Control }>;
