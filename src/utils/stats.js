/**
 * Calculate player stats from registry data.
 */
export function calculateStats(registry) {
  const totalCorrect = registry.get('totalCorrect') || 0;
  const totalWrong = registry.get('totalWrong') || 0;
  const totalMisses = registry.get('totalMisses') || 0;
  const totalBombHits = registry.get('totalBombHits') || 0;
  const activeTypingMs = registry.get('activeTypingMs') || 0;

  // Speed: correct letters per minute of active typing time
  // Only counts time while a fruit was on screen and the player typed it
  const activeTypingMin = activeTypingMs / 60000;
  const speed = activeTypingMin > 0 ? Math.round(totalCorrect / activeTypingMin) : 0;

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
 * Calibrated for reaction-time-based speed (excludes idle/pause time):
 *   ~3 lpm  = just starting (5th percentile)
 *   ~8 lpm  = slow (20th)
 *   ~12 lpm = below average (35th)
 *   ~18 lpm = average kid (50th)
 *   ~28 lpm = above average (70th)
 *   ~35 lpm = fast kid (85th)
 *   ~45 lpm = very fast (95th)
 *   ~55+ lpm = exceptional (99th)
 */
function speedToPercentile(speed) {
  if (speed <= 0) return 0;

  // Sigmoid curve centered around 18 lpm (average for kids)
  const midpoint = 18;
  const k = 0.1;
  const raw = 100 / (1 + Math.exp(-k * (speed - midpoint)));

  return Math.min(99, Math.max(1, Math.round(raw)));
}
