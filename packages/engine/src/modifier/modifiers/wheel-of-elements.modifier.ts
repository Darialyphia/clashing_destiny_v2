import { match } from 'ts-pattern';
import { isSpell } from '../../card/card-utils';
import { TAGS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { PlayerArtifact } from '../../player/player-artifact.entity';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { Modifier } from '../modifier.entity';
import { EmpowerModifier } from './empower.modifier';
import {
  MODIFIER_SPECIAL_EVENTS,
  WheelOfElementsRotateEvent
} from '../modifier.special-events';
import { PlayerArtifactInterceptorModifierMixin } from '../mixins/interceptor.mixin';

export class WheelOfElementsModifier extends Modifier<PlayerArtifact> {
  private _currentElement: 'fire' | 'water' | 'air' | 'earth' = 'fire';

  elementToModifierMap = {
    fire: WheelOfElementsFireModifier,
    water: WheelOfElementsWaterModifier,
    air: WheelOfElementsAirModifier,
    earth: WheelOfElementsEarthModifier
  };

  constructor(game: Game, source: AnyCard) {
    super('wheel-of-elements', game, source, {
      mixins: [
        new PlayerArtifactInterceptorModifierMixin(game, {
          key: 'canBeDestroyed',
          interceptor: () => false
        }),
        new PlayerArtifactInterceptorModifierMixin(game, {
          key: 'canLoseDurability',
          interceptor: () => false
        }),
        new PlayerArtifactInterceptorModifierMixin(game, {
          key: 'canBeTargeted',
          interceptor: () => false
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_PLAY,
          filter: event => {
            if (!event) return false;
            return isSpell(event.data.card) && event.data.card.isAlly(this.target.card);
          },
          handler: async () => {
            await this.rotate();
          }
        })
      ]
    });
  }

  get currentElement() {
    return this._currentElement;
  }

  get nextElement() {
    return match(this._currentElement)
      .with('fire', () => 'earth' as const)
      .with('earth', () => 'water' as const)
      .with('water', () => 'air' as const)
      .with('air', () => 'fire' as const)
      .exhaustive();
  }

  async rotate() {
    await this.rotateTo(this.nextElement);
  }

  async rotateTo(element: 'fire' | 'water' | 'air' | 'earth') {
    if (this._currentElement === element) return;
    const prevElement = this._currentElement;
    await this.target.modifiers.remove(this.elementToModifierMap[this._currentElement]);
    this._currentElement = element;
    await this.target.modifiers.add(
      new this.elementToModifierMap[this._currentElement](this.game, this.target.card)
    );

    await this.game.emit(
      MODIFIER_SPECIAL_EVENTS.MODIFIER_WHEEL_OF_ELEMENTS_ROTATE,
      new WheelOfElementsRotateEvent({
        player: this.target.player,
        from: prevElement,
        to: this._currentElement
      })
    );
  }
}

export class WheelOfElementsFireModifier extends Modifier<PlayerArtifact> {
  constructor(game: Game, source: AnyCard) {
    super('wheel-of-elements-fire', game, source, {
      name: 'Wheel of Elements - Fire',
      description: 'Your hero gains 1 Empower before playing a Fire spell.',
      icon: 'wheel-of-elements-fire',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
          filter: event => {
            if (!event) return false;
            return (
              isSpell(event.data.card) &&
              event.data.card.isAlly(this.target.card) &&
              event.data.card.hasTag(TAGS.FIRE)
            );
          },
          handler: async () => {
            await this.target.player.hero.modifiers.add(
              new EmpowerModifier(game, this.target.card, { amount: 1 })
            );
          }
        })
      ]
    });
  }
}

export class WheelOfElementsWaterModifier extends Modifier<PlayerArtifact> {
  constructor(game: Game, source: AnyCard) {
    super('wheel-of-elements-water', game, source, {
      name: 'Wheel of Elements - Water',
      description: 'Your hero gains 1 Empower before playing a Water spell.',
      icon: 'wheel-of-elements-water',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
          filter: event => {
            if (!event) return false;
            return (
              isSpell(event.data.card) &&
              event.data.card.isAlly(this.target.card) &&
              event.data.card.hasTag(TAGS.WATER)
            );
          },
          handler: async () => {
            await this.target.player.hero.modifiers.add(
              new EmpowerModifier(game, this.target.card, { amount: 1 })
            );
          }
        })
      ]
    });
  }
}

export class WheelOfElementsAirModifier extends Modifier<PlayerArtifact> {
  constructor(game: Game, source: AnyCard) {
    super('wheel-of-elements-air', game, source, {
      name: 'Wheel of Elements - Air',
      description: 'Your hero gains 1 Empower before playing an Air spell.',
      icon: 'wheel-of-elements-air',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
          filter: event => {
            if (!event) return false;
            return (
              isSpell(event.data.card) &&
              event.data.card.isAlly(this.target.card) &&
              event.data.card.hasTag(TAGS.AIR)
            );
          },
          handler: async () => {
            await this.target.player.hero.modifiers.add(
              new EmpowerModifier(game, this.target.card, { amount: 1 })
            );
          }
        })
      ]
    });
  }
}

export class WheelOfElementsEarthModifier extends Modifier<PlayerArtifact> {
  constructor(game: Game, source: AnyCard) {
    super('wheel-of-elements-earth', game, source, {
      name: 'Wheel of Elements - Earth',
      description: 'Your hero gains 1 Empower before playing an Earth spell.',
      icon: 'wheel-of-elements-earth',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
          filter: event => {
            if (!event) return false;
            return (
              isSpell(event.data.card) &&
              event.data.card.isAlly(this.target.card) &&
              event.data.card.hasTag(TAGS.EARTH)
            );
          },
          handler: async () => {
            await this.target.player.hero.modifiers.add(
              new EmpowerModifier(game, this.target.card, { amount: 1 })
            );
          }
        })
      ]
    });
  }
}
