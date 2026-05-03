import {
  useKeyboardControl,
  type Control
} from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { useGameUi } from './useGameClient';
import { keyToString } from 'key-display-names';

export const useGameKeyboardControls = () => {
  const settings = useSettingsStore();

  const ui = useGameUi();

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
