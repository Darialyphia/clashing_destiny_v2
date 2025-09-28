import {
  useKeyboardControl,
  type Control
} from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import {
  useGameState,
  useGameUi,
  useMyBoard,
  useMyPlayer,
  useOpponentPlayer
} from './useGameClient';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { keyToString } from 'key-display-names';

export const useGameKeyboardControls = () => {
  const settings = useSettingsStore();

  const ui = useGameUi();
  const state = useGameState();
  const myBoard = useMyBoard();
  const myPlayer = useMyPlayer();
  const opponentPlayer = useOpponentPlayer();

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
        const cardId = myBoard.value.hand[i - 1];
        if (!cardId) return;
        const card = state.value.entities[cardId] as CardViewModel;
        ui.value.onCardClick(card);
      }
    );
  }

  useKeyboardControl(
    'keyup',
    settings.settings.bindings.interactHero.control,
    () => {
      const hero = state.value.entities[
        myBoard.value.heroZone.hero
      ] as CardViewModel;
      ui.value.onCardClick(hero);
    }
  );

  useKeyboardControl(
    'keyup',
    settings.settings.bindings.toggleDiscardPile.control,
    () => {
      ui.value.DOMSelectors.discardPile(myPlayer.value.id).element?.click();
    }
  );

  useKeyboardControl(
    'keyup',
    settings.settings.bindings.toggleBanishPile.control,
    () => {
      ui.value.DOMSelectors.banishPile(myPlayer.value.id).element?.click();
    }
  );

  useKeyboardControl(
    'keyup',
    settings.settings.bindings.toggleDestinyDeck.control,
    () => {
      ui.value.DOMSelectors.destinyDeck(myPlayer.value.id).element?.click();
    }
  );

  useKeyboardControl(
    'keyup',
    settings.settings.bindings.toggleOpponentDiscardPile.control,
    () => {
      ui.value.DOMSelectors.discardPile(
        opponentPlayer.value.id
      ).element?.click();
    }
  );

  useKeyboardControl(
    'keyup',
    settings.settings.bindings.toggleOpponentBanishPile.control,
    () => {
      ui.value.DOMSelectors.banishPile(
        opponentPlayer.value.id
      ).element?.click();
    }
  );
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
