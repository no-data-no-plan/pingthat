export interface PingStats {
  min: number;
  avg: number;
  max: number;
  /** mean absolute difference between consecutive samples (ms); 0 if <2 samples */
  jitter: number;
}

export function computeStats(samples: number[]): PingStats {
  if (samples.length === 0) return { min: 0, avg: 0, max: 0, jitter: 0 };
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
  let jitter = 0;
  if (samples.length > 1) {
    let sum = 0;
    for (let i = 1; i < samples.length; i++) sum += Math.abs(samples[i] - samples[i - 1]);
    jitter = Math.round(sum / (samples.length - 1));
  }
  return { min, avg, max, jitter };
}
