import { assert, type IndexedRecord } from '@game/shared';
import type { Player } from '../player/player.entity';
import { System } from '../system';
import type { AnyCard, CardOptions } from './entities/card.entity';
import type {
  ArtifactBlueprint,
  AttackBlueprint,
  CardBlueprint,
  HeroBlueprint,
  LocationBlueprint,
  MinionBlueprint,
  PreResponseTarget,
  SpellBlueprint,
  TalentBlueprint
} from './card-blueprint';
import { SpellCard } from './entities/spell.entity';
import { ArtifactCard } from './entities/artifact.entity';
import { MinionCard } from './entities/minion.card';
import { HeroCard } from './entities/hero.entity';
import { AttackCard } from './entities/attack.entity';
import { TalentCard } from './entities/talent.entity';
import { match } from 'ts-pattern';
import { CARD_KINDS, type CardKind } from './card.enums';
import { LocationCard } from './entities/location.entity';

export type CardSystemOptions = {
  cardPool: IndexedRecord<CardBlueprint, 'id'>;
};
export class CardSystem extends System<CardSystemOptions> {
  private cardMap = new Map<string, AnyCard>();

  private cardPool!: IndexedRecord<CardBlueprint, 'id'>;

  private nextId = 0;

  initialize(options: CardSystemOptions) {
    this.cardPool = options.cardPool;
  }

  shutdown() {}

  getBlueprint(id: string) {
    const card = this.cardPool[id];
    assert(card, `Card with id ${id} not found in card pool`);
    return card;
  }

  getCardById<T extends AnyCard = AnyCard>(id: string) {
    return this.cardMap.get(id) as T | undefined;
  }

  get cards() {
    return [...this.cardMap.values()];
  }

  async addCard<T extends AnyCard = AnyCard>(
    player: Player,
    blueprintId: string
  ): Promise<T> {
    const blueprint = this.getBlueprint(blueprintId);
    const id = `${blueprintId}-${this.nextId++}`;

    const card = match(blueprint.kind as CardKind)
      .with(
        CARD_KINDS.SPELL,
        () =>
          new SpellCard(this.game, player, {
            id,
            blueprint
          } as CardOptions<SpellBlueprint<PreResponseTarget>>)
      )
      .with(
        CARD_KINDS.ARTIFACT,
        () =>
          new ArtifactCard(this.game, player, {
            id,
            blueprint
          } as CardOptions<ArtifactBlueprint>)
      )
      .with(
        CARD_KINDS.MINION,
        () =>
          new MinionCard(this.game, player, {
            id,
            blueprint
          } as CardOptions<MinionBlueprint>)
      )
      .with(
        CARD_KINDS.LOCATION,
        () =>
          new LocationCard(this.game, player, {
            id,
            blueprint
          } as CardOptions<LocationBlueprint>)
      )
      .with(
        CARD_KINDS.HERO,
        () =>
          new HeroCard(this.game, player, {
            id,
            blueprint
          } as CardOptions<HeroBlueprint>)
      )
      .with(
        CARD_KINDS.ATTACK,
        () =>
          new AttackCard(this.game, player, {
            id,
            blueprint
          } as CardOptions<AttackBlueprint>)
      )
      .with(
        CARD_KINDS.TALENT,
        () =>
          new TalentCard(this.game, player, {
            id,
            blueprint
          } as CardOptions<TalentBlueprint>)
      )
      .exhaustive();
    await card.init();
    this.cardMap.set(card.id, card);
    return card as any;
  }
}
