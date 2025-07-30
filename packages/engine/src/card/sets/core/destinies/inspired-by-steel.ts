import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LineageBonusModifier } from '../../../../modifier/modifiers/lineage-bonus.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { DestinyBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { ArtifactEquipedEvent } from '../../../entities/artifact.entity';
import { HeroCard } from '../../../entities/hero.entity';
import { knight } from '../heroes/knight';

export const inspiredBySteel: DestinyBlueprint = {
  id: 'inspired-by-steel',
  name: 'Inspired by Steel',
  cardIconId: 'talent-inspired-by-steel',
  description:
    '@Lineage Bonus(Knight)@ : When you equip a Weapon Artifact, gain +1 Attack this turn.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 1,
  async onInit(game, card) {
    await card.modifiers.add(new LineageBonusModifier(game, card, knight.id));
  },
  async onPlay(game, card) {
    const onEquiped = async (event: ArtifactEquipedEvent) => {
      if (!event.data.card.player.equals(card.player)) return;
      if (event.data.card.subkind !== ARTIFACT_KINDS.WEAPON) return;
      if (card.modifiers.get(LineageBonusModifier)?.isActive) return;
      await card.player.hero.modifiers.add(
        new SimpleAttackBuffModifier<HeroCard>(
          'inspired-by-steel-attack-buff',
          game,
          card,
          {
            amount: 1,
            mixins: [new UntilEndOfTurnModifierMixin(game)]
          }
        )
      );
    };

    await card.player.modifiers.add(
      new Modifier('inspired-by-steel', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.ARTIFACT_EQUIPED,
            handler: onEquiped
          })
        ]
      })
    );
  }
};
