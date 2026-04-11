import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import {
  CardNotOwnedError,
  IllegalAttackTargetError,
  NotCurrentPlayerError,
  UnitNotOwnedError,
  UnknownCardError,
  UnknownUnitError
} from '../input-errors';
import { GAME_PHASES } from '../../game/game.enums';
import { isArtifact } from '../../card/card-utils';
import { IllegalGameStateError } from '../../game/game-error';

const schema = defaultInputSchema.extend({
  cardId: z.string(),
  abilityId: z.string()
});

export class UseAbilityInput extends Input<typeof schema> {
  readonly name = 'useAbility';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  private get card() {
    return this.game.cardSystem.getCardById(this.payload.cardId);
  }

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());
    assert(isDefined(this.card), new UnknownCardError(this.payload.cardId));
    assert(
      this.card.player.equals(this.game.turnSystem.initiativePlayer),
      new CardNotOwnedError()
    );
    const card = this.card;
    assert(isArtifact(card), new IllegalGameStateError('Card does not have abilities'));

    const ability = card.getAbility(this.payload.abilityId);
    assert(
      isDefined(ability),
      new IllegalGameStateError('Card does not have this ability')
    );
    assert(
      ability.canUse,
      new IllegalGameStateError('Ability cannot be used at this time')
    );

    await ability.use();
  }
}
