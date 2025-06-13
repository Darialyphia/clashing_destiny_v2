import type { FxAdapter } from '@game/engine/src/client/client';
import { Flip } from 'gsap/Flip';

export const useFxAdapter = (): FxAdapter => {
  return {
    onDeclarePlayCard(card, client) {
      const flipState = Flip.getState(
        client.ui.getCardDOMSelectorInHand(card.id, card.getPlayer().id)
      );

      window.requestAnimationFrame(() => {
        Flip.from(flipState, {
          targets: '#played-card .card',
          duration: 0.4,
          absolute: true,
          ease: Power3.easeOut
        });
      });
    },

    onCancelPlayCard(card, client) {
      const flipState = Flip.getState(
        client.ui.getCardDOMSelectorInPLayedCardZone(card.id)
      );

      window.requestAnimationFrame(() => {
        Flip.from(flipState, {
          targets: client.ui.getCardDOMSelectorInHand(
            card.id,
            card.getPlayer().id
          ),
          duration: 0.4,
          absolute: true,
          ease: Power3.easeOut
        });
      });
    },

    onSelectCardForManaCost(card, client) {
      const flipState = Flip.getState(
        client.ui.getCardDOMSelectorInHand(card.id, card.getPlayer().id)
      );

      window.requestAnimationFrame(() => {
        Flip.from(flipState, {
          targets: client.ui.getCardDOMSelectorInDestinyZone(
            card.id,
            card.getPlayer().id
          ),
          duration: 0.4,
          absolute: true,
          ease: Power3.easeOut
        });
      });
    },

    onUnselectCardForManaCost(card, client) {
      const flipState = Flip.getState(
        client.ui.getCardDOMSelectorInDestinyZone(card.id, card.getPlayer().id)
      );

      window.requestAnimationFrame(() => {
        Flip.from(flipState, {
          targets: client.ui.getCardDOMSelectorInHand(
            card.id,
            card.getPlayer().id
          ),
          duration: 0.4,
          absolute: true,
          ease: Power3.easeOut
        });
      });
    }
  };
};
