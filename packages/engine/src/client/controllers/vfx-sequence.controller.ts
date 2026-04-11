import type { VFXSequence, VFXStep } from '../../game/systems/vfx.system';
import { TypedEventEmitter } from '../../utils/typed-emitter';

type VFXType = VFXStep['type'];
type VFXSequenceEventMap = {
  [Key in VFXType]: VFXStep & { type: Key };
};

export class VFXSequenceController {
  private emitter = new TypedEventEmitter<VFXSequenceEventMap>('parallel');

  async playSequence(sequence: VFXSequence) {
    await Promise.all(
      sequence.tracks.map(async track => {
        for (const step of track.steps) {
          await this.emitter.emit(step.type, step);
        }
      })
    );
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get off() {
    return this.emitter.off.bind(this.emitter);
  }
}
