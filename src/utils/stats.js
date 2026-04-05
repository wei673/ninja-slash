/**
 * Calculate player stats from registry data.
 */
export function calculateStats(registry) {
  const totalCorrect = registry.get('totalCorrect') || 0;
  const totalWrong = registry.get('totalWrong') || 0;
  const totalMisses = registry.get('totalMisses') || 0;
  const totalBombHits = registry.get('totalBombHits') || 0;
  const gameStartTime = registry.get('gameStartTime');

  const totalTimeMs = gameStartTime ? Date.now() - gameStartTime : 0;
  const totalTimeMin = totalTimeMs / 60000;

  // Speed: correct letters per minute
  const speed = totalTimeMin > 0 ? Math.round(totalCorrect / totalTimeMin) : 0;

  // Error rate: errors / total attempts
  const totalAttempts = totalCorrect + totalWrong + totalBombHits;
  const errors = totalWrong + totalBombHits;
  const errorRate = totalAttempts > 0 ? Math.round((errors / totalAttempts) * 100) : 0;

  // Accuracy (inverse of error rate)
  const accuracy = 100 - errorRate;

  // Percentile: "beating X% of humans"
  // Based on approximate typing speed distribution for kids/beginners
  const percentile = speedToPercentile(speed);

  return { speed, errorRate, accuracy, percentile, totalCorrect, totalMisses, totalBombHits, totalWrong };
}

/**
 * Map typing speed (letters/min) to a percentile among kids (ages 5-12).
 * Based on global averages for children's single-key typing speed:
 *   ~5 lpm  = just starting (5th percentile)
 *   ~12 lpm = slow (20th)
 *   ~20 lpm = below average (35th)
 *   ~30 lpm = average kid (50th)
 *   ~45 lpm = above average (70th)
 *   ~60 lpm = fast kid (85th)
 *   ~80 lpm = very fast (95th)
 *   ~100+ lpm = exceptional (99th)
 */
function speedToPercentile(speed) {
  if (speed <= 0) return 0;

  // Sigmoid curve centered around 30 lpm (average for kids)
  const midpoint = 30;
  const k = 0.065;
  const raw = 100 / (1 + Math.exp(-k * (speed - midpoint)));

  return Math.min(99, Math.max(1, Math.round(raw)));
}
