import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import {
  IllegalAbilityError,
  NotCurrentPlayerError,
  UnknownCardError
} from '../input-errors';
import { ArtifactCard } from '../../card/entities/artifact.entity';
import { HeroCard } from '../../card/entities/hero.entity';
import { MinionCard } from '../../card/entities/minion.card';

const schema = defaultInputSchema.extend({
  cardId: z.string(),
  abilityId: z.string()
});

export class UseCardAbilityInput extends Input<typeof schema> {
  readonly name = 'useCardAbility';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  private get card() {
    return this.player.cardManager.findCard(this.payload.cardId)?.card;
  }

  async impl() {
    assert(isDefined(this.card), new UnknownCardError(this.payload.cardId));
    const card = this.card;
    assert(
      card instanceof HeroCard ||
        card instanceof MinionCard ||
        card instanceof ArtifactCard,
      new UnknownCardError(this.payload.cardId)
    );

    assert(card.canUseAbility(this.payload.abilityId), new IllegalAbilityError());
    await card.useAbility(this.payload.abilityId);
  }
}
