import { clamp } from '@game/shared';
import { type MatchmakingStrategy, type MatchmakingParticipant } from '../matchmaking';

export type MMRMatchmakingParticipant<TMeta> = {
  id: string;
  meta: TMeta;
  mmr: number;
  recentWinrate: number;
  winStreak: number;
  lossStreak: number;
  isPromotionGame: boolean;
  isDemotionGame: boolean;
};

export type MMRMatchmakingOptions = {
  matching: {
    maxWinrateDifference: number;
    maxStreakDifference: number;

    minimumMatchScore: number;
    weights: {
      mmrSimilarity: number;
      winrateSimilarity: number;
      streakSimilarity: number;
      stakesAlignment: number;
    };
  };

  tolerance: {
    minTolerance: number;
    maxTolerance: number;
    mmrToleranceIncreasePerSecond: number;
    timeBeforeToleranceExpansionInSeconds: number;
  };

  performance: {
    mmrBucketSize: number;
    maxSearchDistance: number;
    maxCrossBucketSearch: number;
    estimatedPlayerDensity: number;
  };
};

export function createMMRMatchmakingOptions(
  overrides: Partial<{
    matching: Partial<MMRMatchmakingOptions['matching']>;
    tolerance: Partial<MMRMatchmakingOptions['tolerance']>;
    performance: Partial<MMRMatchmakingOptions['performance']>;
  }> = {}
): MMRMatchmakingOptions {
  return {
    matching: {
      maxWinrateDifference: 0.25,
      maxStreakDifference: 10,

      minimumMatchScore: 70,
      weights: {
        mmrSimilarity: 40,
        winrateSimilarity: 25,
        streakSimilarity: 20,
        stakesAlignment: 15
      },
      ...overrides.matching
    },
    tolerance: {
      mmrToleranceIncreasePerSecond: 0.5,
      timeBeforeToleranceExpansionInSeconds: 15,
      minTolerance: 50,
      maxTolerance: 500,
      ...overrides.tolerance
    },
    performance: {
      mmrBucketSize: 200,
      maxSearchDistance: 100,
      maxCrossBucketSearch: 20,
      estimatedPlayerDensity: 3,
      ...overrides.performance
    }
  };
}

export class MMRMatchmakingStrategy<TMeta>
  implements MatchmakingStrategy<MMRMatchmakingParticipant<TMeta>>
{
  constructor(private options: MMRMatchmakingOptions) {}

  get maxCrossBucketSearch() {
    return this.options.performance.maxCrossBucketSearch;
  }

  sorter(
    a: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ): number {
    return a.data.mmr - b.data.mmr;
  }

  matcher(
    a: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ): boolean {
    return (
      this.calculateWeightedMatchScore(a, b) >= this.options.matching.minimumMatchScore
    );
  }

  private getMMrDifference(
    a: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ): number {
    return Math.abs(a.data.mmr - b.data.mmr);
  }

  private isMMRMatch(
    a: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ) {
    const mmrDifference = this.getMMrDifference(a, b);
    const maxAllowedMmrDifference = this.getTolerance(a) + this.getTolerance(b);

    return mmrDifference <= maxAllowedMmrDifference;
  }

  private getMMRScore(
    a: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ): number {
    const diff = this.getMMrDifference(a, b);

    return (
      Math.max(0, 100 - (diff / (this.getTolerance(a) + this.getTolerance(b))) * 100) *
      this.options.matching.weights.mmrSimilarity
    );
  }

  private getWinrateScore(
    a: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ): number {
    const winrateDifference = Math.abs(a.data.recentWinrate - b.data.recentWinrate);
    const winrateScore = Math.max(0, 100 - (winrateDifference / 0.5) * 100); // 0.5 = 50% max difference

    return winrateScore * this.options.matching.weights.winrateSimilarity;
  }

  private getStreakScore(
    a: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ): number {
    const aStreak = a.data.winStreak > 0 ? a.data.winStreak : -a.data.lossStreak;
    const bStreak = b.data.winStreak > 0 ? b.data.winStreak : -b.data.lossStreak;
    const streakDifference = Math.abs(aStreak - bStreak);
    const streakScore = Math.max(0, 100 - (streakDifference / 10) * 100); // 10 = max meaningful streak difference

    return streakScore * this.options.matching.weights.streakSimilarity;
  }

  private getStakesAlignmentScore(
    a: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ): number {
    const aHighStakes = a.data.isPromotionGame || a.data.isDemotionGame;
    const bHighStakes = b.data.isPromotionGame || b.data.isDemotionGame;

    if (aHighStakes && bHighStakes) {
      return 100 * this.options.matching.weights.stakesAlignment; // Perfect: both high stakes
    } else if (aHighStakes || bHighStakes) {
      return 50 * this.options.matching.weights.stakesAlignment; // Suboptimal: mixed stakes
    }
    return 100 * this.options.matching.weights.stakesAlignment; // Both normal games
  }

  private calculateWeightedMatchScore(
    a: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ): number {
    const isMMRMatch = this.isMMRMatch(a, b);

    // If MMR difference exceeds tolerance, this is a hard fail
    if (!isMMRMatch) return 0;

    const mmrScore = this.getMMRScore(a, b);
    const winrateScore = this.getWinrateScore(a, b);
    const streakScore = this.getStreakScore(a, b);
    const stakesScore = this.getStakesAlignmentScore(a, b);

    return (mmrScore + winrateScore + streakScore + stakesScore) / 100;
  }

  private getTolerance(
    participant: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ) {
    const timeSpentInSeconds = (Date.now() - participant.joinedAt) / 1000;
    const timeToExpandTolerance =
      timeSpentInSeconds - this.options.tolerance.timeBeforeToleranceExpansionInSeconds;

    const toleranceIncrease =
      this.options.tolerance.mmrToleranceIncreasePerSecond * timeToExpandTolerance;

    return clamp(
      this.options.tolerance.minTolerance + toleranceIncrease,
      this.options.tolerance.minTolerance,
      this.options.tolerance.maxTolerance
    );
  }

  processUnmatched(
    participant: MMRMatchmakingParticipant<TMeta>
  ): MMRMatchmakingParticipant<TMeta> {
    return participant;
  }

  equals(
    a: MMRMatchmakingParticipant<TMeta>,
    b: MMRMatchmakingParticipant<TMeta>
  ): boolean {
    return a.id === b.id;
  }

  getBucket(
    participant: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ): string {
    const mmrBucket = Math.floor(
      participant.data.mmr / this.options.performance.mmrBucketSize
    );

    // Create sub-buckets for high-stakes games to prioritize matching them together
    const stakesModifier =
      participant.data.isPromotionGame || participant.data.isDemotionGame
        ? 'high-stakes'
        : 'normal';

    // Bucket by performance trend (hot streak, cold streak, neutral)
    let performanceBucket = 'neutral';
    if (participant.data.winStreak >= 3) {
      performanceBucket = 'hot';
    } else if (participant.data.lossStreak >= 3) {
      performanceBucket = 'cold';
    }

    return `${mmrBucket}-${stakesModifier}-${performanceBucket}`;
  }

  getMaxSearchDistance(
    participant: MatchmakingParticipant<MMRMatchmakingParticipant<TMeta>>
  ): number {
    // Estimate how many players we need to check based on tolerance
    // Higher tolerance = wider search, but cap it for performance
    const estimatedRange = this.getTolerance(participant) * 2;
    return Math.min(
      estimatedRange * this.options.performance.estimatedPlayerDensity,
      this.options.performance.maxSearchDistance
    );
  }
}
