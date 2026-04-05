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
 * Map typing speed (letters/min) to a percentile using a sigmoid-like curve.
 * Calibrated for kids playing a letter-at-a-time game:
 *   ~10 lpm = very slow (10th percentile)
 *   ~30 lpm = below average (30th)
 *   ~50 lpm = average (50th)
 *   ~80 lpm = above average (75th)
 *   ~120 lpm = fast (90th)
 *   ~160+ lpm = very fast (99th)
 */
function speedToPercentile(speed) {
  if (speed <= 0) return 0;

  // Sigmoid curve centered around 50 lpm
  // p = 100 / (1 + e^(-k*(speed - midpoint)))
  const midpoint = 50;
  const k = 0.045;
  const raw = 100 / (1 + Math.exp(-k * (speed - midpoint)));

  return Math.min(99, Math.max(1, Math.round(raw)));
}
