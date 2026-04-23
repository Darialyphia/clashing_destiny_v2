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
import {
  CardInterceptorModifierMixin,
  PlayerArtifactInterceptorModifierMixin
} from '../mixins/interceptor.mixin';
import { wheelOfTheElements } from '../../card/sets/core/elementalist/artifacts/wheel-of-the-elements';
import type { Player } from '../../player/player.entity';
import { CardAuraModifierMixin } from '../mixins/aura.mixin';

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

  activate() {
    console.log(this.target);
    return this.target.modifiers.add(
      new this.elementToModifierMap[this._currentElement](this.game, this.target.card)
    );
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
      description: 'Your fire spells are played as if your hero had 1 more level.',
      icon: 'icons/wheel-of-elements-fire',
      mixins: [
        new CardAuraModifierMixin(game, source.player.hero, {
          isElligible(candidate) {
            return (
              candidate.player.equals(source.player) &&
              isSpell(candidate) &&
              candidate.hasTag(TAGS.FIRE)
            );
          },
          getModifiers: () => {
            return [
              new Modifier('empower-level-bonus-aura', game, source, {
                mixins: [
                  new CardInterceptorModifierMixin(game, {
                    key: 'playerLevel',
                    interceptor: value => value + this.stacks
                  })
                ]
              })
            ];
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
      description: 'Your water spells are played as if your hero had 1 more level.',
      icon: 'icons/wheel-of-elements-water',
      mixins: [
        new CardAuraModifierMixin(game, source.player.hero, {
          isElligible(candidate) {
            return (
              candidate.player.equals(source.player) &&
              isSpell(candidate) &&
              candidate.hasTag(TAGS.WATER)
            );
          },
          getModifiers: () => {
            return [
              new Modifier('empower-level-bonus-aura', game, source, {
                mixins: [
                  new CardInterceptorModifierMixin(game, {
                    key: 'playerLevel',
                    interceptor: value => value + this.stacks
                  })
                ]
              })
            ];
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
      description: 'Your air spells are played as if your hero had 1 more level.',
      icon: 'icons/wheel-of-elements-air',
      mixins: [
        new CardAuraModifierMixin(game, source.player.hero, {
          isElligible(candidate) {
            return (
              candidate.player.equals(source.player) &&
              isSpell(candidate) &&
              candidate.hasTag(TAGS.AIR)
            );
          },
          getModifiers: () => {
            return [
              new Modifier('empower-level-bonus-aura', game, source, {
                mixins: [
                  new CardInterceptorModifierMixin(game, {
                    key: 'playerLevel',
                    interceptor: value => value + this.stacks
                  })
                ]
              })
            ];
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
      description: 'Your earth spells are played as if your hero had 1 more level.',
      icon: 'icons/wheel-of-elements-earth',
      mixins: [
        new CardAuraModifierMixin(game, source.player.hero, {
          isElligible(candidate) {
            return (
              candidate.player.equals(source.player) &&
              isSpell(candidate) &&
              candidate.hasTag(TAGS.EARTH)
            );
          },
          getModifiers: () => {
            return [
              new Modifier('empower-level-bonus-aura', game, source, {
                mixins: [
                  new CardInterceptorModifierMixin(game, {
                    key: 'playerLevel',
                    interceptor: value => value + this.stacks
                  })
                ]
              })
            ];
          }
        })
      ]
    });
  }
}

export const getWheelOfElementModifier = (game: Game, player: Player) => {
  const artifact = player.artifactManager.artifacts.find(
    artifact => artifact.card.blueprintId === wheelOfTheElements.id
  );

  return artifact?.modifiers.get(WheelOfElementsModifier);
};
