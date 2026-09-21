import type { FxAdapter } from '@game/engine/src/client/client';
import { Flip } from 'gsap/Flip';

export const useFxAdapter = (): FxAdapter => {
  return {
    onDeclarePlayCard() {},

    async onCancelPlayCard(card, client) {
      const el = document.querySelector(
        client.ui.DOMSelectors.draggedCard(card.id).selector
      );
      if (!el) return;
      const flipState = Flip.getState(el);

      const handEl = client.ui.DOMSelectors.hand(card.player.id).element;

      const observer = new MutationObserver(() => {
        const target = document.querySelector(
          client.ui.DOMSelectors.cardInHand(card.id, card.player.id).selector
        );

        if (!target) {
          return;
        }

        observer.disconnect();
        Flip.from(flipState, {
          targets: target,
          duration: 0.3,
          absolute: true,
          ease: Power1.easeIn
        });
      });
      observer.observe(handEl!, { childList: true, subtree: true });
    }
  };
};
