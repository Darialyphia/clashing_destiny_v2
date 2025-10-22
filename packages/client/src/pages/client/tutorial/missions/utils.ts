import type { SerializedInput } from '@game/engine/src/input/input-system';
import type { TutorialStepValidationResult } from '@game/engine/src/tutorial/tutorial';
import type { z } from 'zod';

export const simpleStepValidation =
  <T>(schema: () => z.ZodType<T>, msg: string) =>
  (input: SerializedInput): TutorialStepValidationResult =>
    schema().safeParse(input).success
      ? { status: 'success' }
      : { status: 'error', errorMessage: msg };
