import { KEYWORDS } from '../../card/card-keywords';
import { CardEffectTriggeredEvent } from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { CardAuraModifierMixin } from '../mixins/aura.mixin';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { UntilEndOfTurnModifierMixin } from '../mixins/until-end-of-turn.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';
import { WhileOnBoardModifier } from './while-on-board.modifier';

export class ZealModifier extends WhileOnBoardModifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<MinionCard>[];
      zealedModifiers: Modifier<MinionCard>[];
      amount: number;
      onGainZeal?: (candidate: MinionCard) => void;
      onLoseZeal?: (candidate: MinionCard) => void;
    }
  ) {
    super(KEYWORDS.ZEAL.id, game, source, {
      name: KEYWORDS.ZEAL.name,
      description: KEYWORDS.ZEAL.description,
      icon: 'icons/keyword-zeal',
      mixins: [
        new CardAuraModifierMixin<MinionCard>(game, source, {
          isElligible: candidate => {
            return candidate.equals(this.target);
          },
          getModifiers() {
            return options.zealedModifiers;
          },
          onGainAura: async candidate => {
            if (options.onGainZeal) {
              await this.game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card: candidate,
                  message: `${candidate.blueprint.name} becomes Zealed!`
                })
              );
              await options.onGainZeal(candidate);
            }
          },
          onLoseAura(candidate) {
            options.onLoseZeal?.(candidate);
          }
        }),
        new TogglableModifierMixin(
          game,
          () =>
            this.target.isOnBattlefield &&
            this.target.battlefield!.commandmentScore >= options.amount
        ),
        ...(options.mixins ?? [])
      ]
    });
  }
}
