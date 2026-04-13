import {
  useKeyboardControl,
  type Control
} from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { useGameUi, useMyPlayer } from './useGameClient';
import { keyToString } from 'key-display-names';

export const useGameKeyboardControls = () => {
  const settings = useSettingsStore();

  const ui = useGameUi();
  const player = useMyPlayer();

  useKeyboardControl(
    'keyup',
    settings.settings.bindings.showHand.control,
    () => {
      ui.value.isHandExpanded = !ui.value.isHandExpanded;
    }
  );
  useKeyboardControl('keyup', settings.settings.bindings.pass.control, () => {
    const actions = ui.value.globalActions;
    const passAction = actions.find(a => a.id === 'pass');
    if (!passAction) return;
    if (passAction.isDisabled) return;
    passAction.onClick();
  });

  for (let i = 1; i <= 9; i++) {
    useKeyboardControl(
      'keyup',
      settings.settings.bindings[
        `interactCardInHand${i as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
      ].control,
      () => {
        if (!ui.value.isHandExpanded) return;
        const card = player.value.hand[i - 1];
        if (!card) return;
        ui.value.onCardClick(card);
      }
    );
  }
};

export const useKeybordShortcutLabel = () => {
  return (control: Control) => {
    const formattedKey = computed(() => {
      return keyToString(control.key);
    });

    if (control.modifier)
      return `${control.modifier.toUpperCase()} + ${formattedKey.value}`;

    return `${formattedKey.value}`;
  };
};
