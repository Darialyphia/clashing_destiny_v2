import type { FxAdapter } from '@game/engine/src/client/client';
import { Flip } from 'gsap/Flip';

export const useFxAdapter = (): FxAdapter => {
  return {
    onDeclarePlayCard(card, client) {
      //   const flipState = Flip.getState(
      //     client.ui.DOMSelectors.cardInHand(card.id, card.player.id).selector
      //   );
      //   window.requestAnimationFrame(() => {
      //     Flip.from(flipState, {
      //       targets: client.ui.DOMSelectors.anyCardOnPlayCardZone.selector,
      //       duration: 0.4,
      //       absolute: true,
      //       ease: Power3.easeOut
      //     });
      //   });
    },

    async onCancelPlayCard(card, client) {
      const el = document.querySelector(
        client.ui.DOMSelectors.draggedCard(card.id).selector
      );
      if (!el) return;
      const flipState = Flip.getState(el);
      client.ui.optimisticState.isCancellingPlayCard = true;

      const handEl = client.ui.DOMSelectors.hand(card.player.id).element;
      const observer = new MutationObserver(() => {
        const target = document.querySelector(
          client.ui.DOMSelectors.cardInHand(card.id, card.player.id).selector
        );
        if (!target) {
          client.ui.optimisticState.isCancellingPlayCard = false;
          return;
        }

        observer.disconnect();
        Flip.from(flipState, {
          targets: target,
          duration: 0.25,
          absolute: true,
          ease: Power1.easeOut,
          onComplete: () => {
            client.ui.optimisticState.isCancellingPlayCard = false;
          }
        });
      });
      observer.observe(handEl!, { childList: true, subtree: true });
    }
  };
};
