import type { Point } from '@game/shared';
import {
  BLEND_MODES,
  type BlendMode,
  type VFXSequence,
  type VFXSequenceTrack
} from '../game/systems/vfx.system';
import type { Game } from '../game/game';
import type { GenericAOEShape } from '../aoe/aoe-shape';
import type { AnyCard } from './entities/card.entity';

export const lyonarSpawn = (position: Point): VFXSequence => {
  return {
    tracks: [
      {
        steps: [
          {
            type: 'addLightAt',
            params: {
              blendMode: BLEND_MODES.OVERLAY,
              color: '#ffc864',
              position,
              offset: { x: 0, y: -50 },
              opacity: 1,
              duration: 1000,
              radius: 270
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_teleportrecall',
              animationSequence: ['default'],
              offset: { x: 0, y: -25 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_f1_inmolation',
              animationSequence: ['default'],
              offset: { x: 0, y: -15 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'smokeground',
              animationSequence: ['smokeground'],
              offset: { x: 0, y: 40 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      }
    ]
  };
};

export const songhaiSpawn = (position: Point): VFXSequence => {
  return {
    tracks: [
      {
        steps: [
          {
            type: 'addLightAt',
            params: {
              blendMode: BLEND_MODES.OVERLAY,
              color: '#ff6464',
              position,
              offset: { x: 0, y: -25 },
              opacity: 1,
              duration: 1000,
              radius: 270
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_f2_teleport',
              animationSequence: ['default'],
              offset: { x: 30, y: -25 },
              scale: 1.5,
              flipX: true
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_f2_teleport',
              animationSequence: ['default'],
              offset: { x: 30, y: -15 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_teleportrecall',
              animationSequence: ['default'],
              offset: { x: 0, y: -25 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      }
    ]
  };
};

export const vetruvianSpawn = (position: Point): VFXSequence => {
  return {
    tracks: [
      {
        steps: [
          {
            type: 'addLightAt',
            params: {
              blendMode: BLEND_MODES.OVERLAY,
              color: '#ffff00',
              position,
              offset: { x: 0, y: -25 },
              opacity: 1,
              duration: 1000,
              radius: 270
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_bladestorm',
              animationSequence: ['default'],
              offset: { x: 0, y: -25 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'smokeground',
              animationSequence: ['smokeground'],
              offset: { x: 0, y: 40 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      }
    ]
  };
};

export const neutralSpawn = (position: Point): VFXSequence => {
  return {
    tracks: [
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_teleportrecall',
              animationSequence: ['default'],
              offset: { x: 0, y: 0 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_bladestorm',
              animationSequence: ['default'],
              offset: { x: 0, y: -25 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'fx_swirl',
              animationSequence: ['swirlloop'],
              offset: { x: 0, y: 20 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      },
      {
        steps: [
          {
            type: 'playSpriteAt',
            params: {
              position,
              resourceName: 'smokeground',
              animationSequence: ['smokeground'],
              offset: { x: 0, y: 40 },
              scale: 1.5,
              flipX: false
            }
          }
        ]
      }
    ]
  };
};

export const forEachUnit = (
  ctx: { game: Game; aoe: GenericAOEShape; targets: Point[]; card: AnyCard },
  steps: (pos: Point) => VFXSequenceTrack[]
): VFXSequenceTrack[] => {
  const { game, aoe, targets, card } = ctx;
  const aoeTargets = game.unitSystem
    .getUnitsInAOE(aoe, targets, card.player)
    .map(u => u.position.serialize());

  return aoeTargets.map(target => steps(target)).flat();
};

export const lightOverlay = (
  game: Game,
  opts: { color: string; blendMode?: BlendMode; opacity?: number; duration?: number }
): VFXSequenceTrack => {
  return {
    steps: [
      {
        type: 'addLightAt',
        params: {
          blendMode: opts.blendMode ?? BLEND_MODES.SCREEN,
          color: opts.color,
          position: {
            x: Math.round(game.boardSystem.map.cols / 2),
            y: Math.round(game.boardSystem.map.rows / 2)
          },
          offset: { x: 0, y: 0 },
          opacity: opts.opacity ?? 0.15,
          duration: opts.duration ?? 1000,
          radius: 3000
        }
      }
    ]
  };
};
