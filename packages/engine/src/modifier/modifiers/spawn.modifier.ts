import type { Game } from '../..';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import { GAME_EVENTS } from '../../game/game.events';
import { TARGETING_TYPE } from '../../targeting/targeting-strategy';
import { UnitEffectTriggeredEvent } from '../../unit/unit-events';
import type { Unit } from '../../unit/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit.enums';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SpawnModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<MinionCard>[]; stacks: number; blueprintId: string }
  ) {
    super(KEYWORDS.SPAWN.id, game, source, {
      mixins: [
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new SpawnUnitModifier(game, source, {
              mixins: [],
              charges: options.stacks ?? 0,
              blueprintId: options.blueprintId ?? ''
            }),
          ...(options?.mixins ?? [])
        })
      ]
    });
  }
}

export class SpawnUnitModifier extends Modifier<Unit> {
  charges: number;
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      modifierType?: string;
      charges: number;
      blueprintId: string;
    }
  ) {
    super(options.modifierType ?? KEYWORDS.SPAWN.id, game, source, {
      name: KEYWORDS.SPAWN.name,
      description: () =>
        `${KEYWORDS.SPAWN.description.replace('X', `a ${game.cardPool[options.blueprintId]?.name}`)} (${this.charges} charges remaining)`,
      icon: 'icons/keyword-spawn',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.TURN_START,
          filter: event => {
            if (!event) return false;

            return this.nearbyEmptySpaces.length > 0 && this.charges > 0;
          },
          handler: async () => {
            await this.game.emit(
              UNIT_EVENTS.UNIT_EFFECT_TRIGGERED,
              new UnitEffectTriggeredEvent({ unit: this.target })
            );

            const [space] = await this.game.interaction.selectSpacesOnBoard({
              player: this.target.player,
              getLabel: () => `${this.target.card.blueprint.name}: Select spawn location`,
              isElligible: candidate => {
                return this.nearbyEmptySpaces.some(space => space.equals(candidate));
              },
              timeoutFallback: [],
              canCommit(selectedSpaces) {
                return selectedSpaces.length === 1;
              },
              isDone(selectedSpaces) {
                return selectedSpaces.length === 1;
              },
              source: this.target.card,
              getAoe(selectedSpaces) {
                return new PointAOEShape(TARGETING_TYPE.EMPTY, {
                  override: selectedSpaces[0]
                });
              }
            });
            if (!space) return;
            const cardToSpawn = await this.target.player.generateCard<MinionCard>(
              options.blueprintId,
              this.target.card.isFoil
            );

            await cardToSpawn.playAt(space);
            await this.charges--;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
    this.charges = options.charges;
  }

  get nearbyEmptySpaces() {
    return (
      this.game.boardSystem
        .getCellAt(this.target.position)
        ?.adjacent.filter(
          space => !space.isOccupied && space.player?.equals(this.target.player)
        ) ?? []
    );
  }
}
