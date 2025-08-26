import type { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { Matchmaking } from '../entities/matchmaking.entity';

export class MatchmakingReadRepository {
  constructor(protected db: DatabaseReader) {}

  async getById(matchmakingId: Id<'matchmaking'>) {
    return this.db.get(matchmakingId);
  }

  async getByName(name: string) {
    return this.db
      .query('matchmaking')
      .filter(q => q.eq(q.field('name'), name))
      .first();
  }
}

export class MatchmakingRepository extends MatchmakingReadRepository {
  declare protected db: DatabaseWriter;

  constructor(db: DatabaseWriter) {
    super(db);
    this.db = db;
  }

  async save(matchmaking: Matchmaking) {
    await this.db.insert('matchmaking', {
      name: matchmaking.name,
      startedAt: matchmaking.startedAt,
      nextInvocationId: matchmaking.nextInvocationId
    });

    await Promise.all(
      matchmaking.participants.map(async user => {
        await this.db.replace(user.id, {
          matchmakingId: matchmaking.id,
          userId: user.userId
        });
      })
    );
  }
}
