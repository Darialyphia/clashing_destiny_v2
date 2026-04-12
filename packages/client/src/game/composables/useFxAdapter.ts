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

    onCancelPlayCard(card, client) {
      // const flipState = Flip.getState(
      //   client.ui.DOMSelectors.cardInPlayedCardZone(card.id).selector
      // );
      // window.requestAnimationFrame(() => {
      //   Flip.from(flipState, {
      //     targets: client.ui.DOMSelectors.cardInHand(card.id, card.player.id)
      //       .selector,
      //     duration: 0.5,
      //     absolute: true,
      //     ease: 'back.out'
      //   });
      // });
    }
  };
};
