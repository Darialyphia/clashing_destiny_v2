import { assert, type IndexedRecord } from '@game/shared';
import type { Player } from '../player/player.entity';
import { System } from '../system';
import type { AnyCard, CardOptions } from './entities/card.entity';
import type {
  CardBlueprint,
  HeroBlueprint,
  MinionBlueprint,
  SpellBlueprint,
  ArtifactBlueprint
} from './card-blueprint';
import { SpellCard } from './entities/spell.entity';
import { MinionCard } from './entities/minion.entity';
import { HeroCard } from './entities/hero.entity';
import { match } from 'ts-pattern';
import { CARD_KINDS, CARD_LOCATIONS, type CardKind } from './card.enums';
import { GAME_EVENTS } from '../game/game.events';
import { ArtifactCard } from './entities/artifact.entity';
import { isHero } from './card-utils';

export type CardSystemOptions = {
  cardPool: IndexedRecord<CardBlueprint, 'id'>;
};
export class CardSystem extends System<CardSystemOptions> {
  private cardMap = new Map<string, AnyCard>();

  private cardPool!: IndexedRecord<CardBlueprint, 'id'>;

  private cardsPlayed: AnyCard[] = [];

  private nextId = 0;

  initialize(options: CardSystemOptions) {
    this.cardPool = options.cardPool;

    this.game.on(GAME_EVENTS.CARD_AFTER_PLAY, event => {
      this.cardsPlayed.unshift(event.data.card);
    });
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

  getAllCardsInPlay() {
    return this.cards.filter(
      card =>
        card.location === CARD_LOCATIONS.BASE ||
        card.location === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
        card.location === CARD_LOCATIONS.RIGHT_BATTLEFIELD ||
        isHero(card)
    );
  }

  get cards() {
    return [...this.cardMap.values()];
  }

  async addCard<T extends AnyCard>(
    player: Player,
    blueprintId: string,
    isFoil: boolean
  ): Promise<T> {
    const blueprint = this.getBlueprint(blueprintId);
    const id = `${blueprintId}-${this.nextId++}`;

    const card = match(blueprint.kind as CardKind)
      .with(
        CARD_KINDS.SPELL,
        () =>
          new SpellCard(this.game, player, {
            id,
            blueprint,
            isFoil
          } as CardOptions<SpellBlueprint>)
      )
      .with(
        CARD_KINDS.MINION,
        () =>
          new MinionCard(this.game, player, {
            id,
            blueprint,
            isFoil
          } as CardOptions<MinionBlueprint>)
      )
      .with(
        CARD_KINDS.HERO,
        () =>
          new HeroCard(this.game, player, {
            id,
            blueprint,
            isFoil
          } as CardOptions<HeroBlueprint>)
      )
      .with(
        CARD_KINDS.ARTIFACT,
        () =>
          new ArtifactCard(this.game, player, {
            id,
            blueprint
          } as CardOptions<ArtifactBlueprint>)
      )
      .exhaustive();
    await card.init();

    this.cardMap.set(card.id, card);
    return card as any;
  }

  getLastPlayedCard<T extends AnyCard = AnyCard>(
    predicate: (card: AnyCard) => boolean
  ): T | undefined {
    const card = this.cardsPlayed.find(predicate);
    if (!card) return undefined;
    return card as T;
  }
}
