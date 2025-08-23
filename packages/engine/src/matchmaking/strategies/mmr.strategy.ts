import type { MatchmakingStrategy, MatchmakingParticipant } from '../matchmaking';

export type MMRMatchmakingParticipant = {
  id: string;
  mmr: number;
  tolerance: number;
  recentWinrate: number;
  winStreak: number;
  lossStreak: number;
  isPromotionGame: boolean; // will they go up a ranking division if they win
  isDemotionGame: boolean; // will they go down a ranking division if they lose
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
    mmrToleranceIncreasePerSecond: number;
    timeBeforeToleranceExpansionInSeconds: number;
    maxTolerance: number;
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
      timeBeforeToleranceExpansionInSeconds: 30,
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

export class MMRMatchmakingStrategy
  implements MatchmakingStrategy<MMRMatchmakingParticipant>
{
  constructor(private options: MMRMatchmakingOptions) {}

  get maxCrossBucketSearch() {
    return this.options.performance.maxCrossBucketSearch;
  }

  sorter(
    a: MatchmakingParticipant<MMRMatchmakingParticipant>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant>
  ): number {
    return a.data.mmr - b.data.mmr;
  }

  matcher(
    a: MatchmakingParticipant<MMRMatchmakingParticipant>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant>
  ): boolean {
    return (
      this.calculateWeightedMatchScore(a, b) >= this.options.matching.minimumMatchScore
    );
  }

  private calculateWeightedMatchScore(
    a: MatchmakingParticipant<MMRMatchmakingParticipant>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant>
  ): number {
    const weights = this.options.matching.weights;
    let totalScore = 0;

    // MMR Similarity Score (0-100)
    const mmrDifference = Math.abs(a.data.mmr - b.data.mmr);
    const maxAllowedMmrDifference = a.data.tolerance + b.data.tolerance;

    // If MMR difference exceeds tolerance, this is a hard fail
    if (mmrDifference > maxAllowedMmrDifference) return 0;

    const mmrScore = Math.max(0, 100 - (mmrDifference / maxAllowedMmrDifference) * 100);
    totalScore += (mmrScore * weights.mmrSimilarity) / 100;

    // Winrate Similarity Score (0-100)
    const winrateDifference = Math.abs(a.data.recentWinrate - b.data.recentWinrate);
    const winrateScore = Math.max(0, 100 - (winrateDifference / 0.5) * 100); // 0.5 = 50% max difference
    totalScore += (winrateScore * weights.winrateSimilarity) / 100;

    // Streak Similarity Score (0-100)
    const aStreak = a.data.winStreak > 0 ? a.data.winStreak : -a.data.lossStreak;
    const bStreak = b.data.winStreak > 0 ? b.data.winStreak : -b.data.lossStreak;
    const streakDifference = Math.abs(aStreak - bStreak);
    const streakScore = Math.max(0, 100 - (streakDifference / 10) * 100); // 10 = max meaningful streak difference
    totalScore += (streakScore * weights.streakSimilarity) / 100;

    // Stakes Alignment Score (0-100)
    const aHighStakes = a.data.isPromotionGame || a.data.isDemotionGame;
    const bHighStakes = b.data.isPromotionGame || b.data.isDemotionGame;

    let stakesScore = 100; // Default: both normal games
    if (aHighStakes && bHighStakes) {
      stakesScore = 100; // Perfect: both high stakes
    } else if (aHighStakes || bHighStakes) {
      stakesScore = 50; // Suboptimal: mixed stakes
    }
    totalScore += (stakesScore * weights.stakesAlignment) / 100;

    return totalScore;
  }

  /**
   * Get detailed match quality breakdown for analytics/debugging
   */
  getMatchQuality(
    a: MatchmakingParticipant<MMRMatchmakingParticipant>,
    b: MatchmakingParticipant<MMRMatchmakingParticipant>
  ): {
    totalScore: number;
    breakdown: {
      mmrScore: number;
      winrateScore: number;
      streakScore: number;
      stakesScore: number;
    };
    wouldMatch: boolean;
  } {
    const weights = this.options.matching.weights;

    // Calculate individual scores
    const mmrDifference = Math.abs(a.data.mmr - b.data.mmr);
    const maxAllowedMmrDifference = a.data.tolerance + b.data.tolerance;
    const mmrScore =
      mmrDifference > maxAllowedMmrDifference
        ? 0
        : Math.max(0, 100 - (mmrDifference / maxAllowedMmrDifference) * 100);

    const winrateDifference = Math.abs(a.data.recentWinrate - b.data.recentWinrate);
    const winrateScore = Math.max(0, 100 - (winrateDifference / 0.5) * 100);

    const aStreak = a.data.winStreak > 0 ? a.data.winStreak : -a.data.lossStreak;
    const bStreak = b.data.winStreak > 0 ? b.data.winStreak : -b.data.lossStreak;
    const streakDifference = Math.abs(aStreak - bStreak);
    const streakScore = Math.max(0, 100 - (streakDifference / 10) * 100);

    const aHighStakes = a.data.isPromotionGame || a.data.isDemotionGame;
    const bHighStakes = b.data.isPromotionGame || b.data.isDemotionGame;
    let stakesScore = 100;
    if (aHighStakes && bHighStakes) stakesScore = 100;
    else if (aHighStakes || bHighStakes) stakesScore = 50;

    const totalScore =
      (mmrScore * weights.mmrSimilarity) / 100 +
      (winrateScore * weights.winrateSimilarity) / 100 +
      (streakScore * weights.streakSimilarity) / 100 +
      (stakesScore * weights.stakesAlignment) / 100;

    return {
      totalScore,
      breakdown: { mmrScore, winrateScore, streakScore, stakesScore },
      wouldMatch: totalScore >= this.options.matching.minimumMatchScore
    };
  }

  processUnmatched(
    participant: MMRMatchmakingParticipant,
    timeSpentInSeconds: number
  ): MMRMatchmakingParticipant {
    return {
      ...participant,
      tolerance:
        timeSpentInSeconds > this.options.tolerance.timeBeforeToleranceExpansionInSeconds
          ? Math.min(
              participant.tolerance +
                this.options.tolerance.mmrToleranceIncreasePerSecond * timeSpentInSeconds,
              this.options.tolerance.maxTolerance
            )
          : participant.tolerance
    };
  }

  equals(a: MMRMatchmakingParticipant, b: MMRMatchmakingParticipant): boolean {
    return a.mmr === b.mmr && a.tolerance === b.tolerance;
  }

  getBucket(participant: MatchmakingParticipant<MMRMatchmakingParticipant>): string {
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
    participant: MatchmakingParticipant<MMRMatchmakingParticipant>
  ): number {
    // Estimate how many players we need to check based on tolerance
    // Higher tolerance = wider search, but cap it for performance
    const estimatedRange = participant.data.tolerance * 2;
    return Math.min(
      estimatedRange * this.options.performance.estimatedPlayerDensity,
      this.options.performance.maxSearchDistance
    );
  }
}
