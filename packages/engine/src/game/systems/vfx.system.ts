import type { EmptyObject, Point, Values } from '@game/shared';
import { System } from '../../system';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { Unit } from '../../unit/unit.entity';

export const ANIMATIONS_NAMES = {
  IDLE: 'idle',
  BREATHING: 'breathing',
  ATTACK: 'attack',
  DEATH: 'death',
  RUN: 'run',
  HIT: 'hit',
  DEFAULT: 'default',
  ACTIVE: 'active',
  CAST_START: 'caststart',
  CAST: 'cast',
  CAST_LOOP: 'castloop',
  CAST_END: 'castend',
  PROJECTILE: 'projectile'
} as const;
export type AnimationName = Values<typeof ANIMATIONS_NAMES>;

export const BLEND_MODES = {
  SCREEN: 'screen',
  MULTIPLY: 'multiply',
  OVERLAY: 'overlay',
  COLOR_DODGE: 'color-dodge',
  HARD_LIGHT: 'hard-light',
  SOFT_LIGHT: 'soft-light'
} as const;
export type BlendMode = Values<typeof BLEND_MODES>;

export type VFXStep =
  | {
      type: 'shakeEntity';
      params: {
        units: string[];
        x: boolean;
        y: boolean;
        amplitude: number;
        duration: number;
      };
    }
  | {
      type: 'shakeScreen';
      params: {
        x: boolean;
        y: boolean;
        amplitude: number;
        duration: number;
      };
    }
  | {
      type: 'playSpriteAt';
      params: {
        position: Point;
        resourceName: string;
        animationSequence: string[];
        offset: Point;
        scale: number;
        flipX: boolean;
        tint?: string;
      };
    }
  | {
      type: 'playSpriteOnScreenCenter';
      params: {
        resourceName: string;
        animationSequence: string[];
        offset: Point;
        scale: number;
        flipX: boolean;
      };
    }
  | {
      type: 'tintUnits';
      params: {
        units: string[];
        color: string;
        blendMode: BlendMode;
        opacity: number;
        duration: number;
      };
    }
  | {
      type: 'tintScreen';
      params: {
        color: string;
        blendMode: BlendMode;
        opacity: number;
        duration: number;
      };
    }
  | {
      type: 'addLightAt';
      params: {
        position: Point;
        color: string;
        offset: Point;
        opacity: number;
        radius: number;
        duration: number;
        blendMode: BlendMode;
      };
    }
  | {
      type: 'wait';
      params: {
        duration: number;
      };
    };

export type VFXSequenceTrack = {
  steps: VFXStep[];
};
export type VFXSequence = {
  tracks: VFXSequenceTrack[];
};

export const VFX_EVENTS = {
  VFX_PLAY_SEQUENCE: 'fx.play_sequence'
} as const;
export type VFXEvent = Values<typeof VFX_EVENTS>;

export type VFXEventMap = {
  [VFX_EVENTS.VFX_PLAY_SEQUENCE]: VFXPlaySequenceEvent;
};

export class VFXSystem extends System<EmptyObject> {
  initialize(): void {}

  shutdown() {}

  async playSequence(sequence: VFXSequence) {
    await this.game.emit(
      VFX_EVENTS.VFX_PLAY_SEQUENCE,
      new VFXPlaySequenceEvent({ sequence })
    );
  }
}

export class VFXPlaySequenceEvent extends TypedSerializableEvent<
  { sequence: VFXSequence },
  {
    sequence: VFXSequence;
  }
> {
  serialize() {
    return { sequence: this.data.sequence };
  }
}
