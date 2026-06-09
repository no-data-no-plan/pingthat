import { describe, it, expect } from 'vitest';
import { computeStats } from './ping-stats';

describe('computeStats', () => {
  it('empty -> all zero', () => {
    expect(computeStats([])).toEqual({ min: 0, avg: 0, max: 0, jitter: 0 });
  });
  it('single sample -> min=avg=max=sample, jitter 0', () => {
    expect(computeStats([42])).toEqual({ min: 42, avg: 42, max: 42, jitter: 0 });
  });
  it('all equal -> jitter 0', () => {
    expect(computeStats([50, 50, 50])).toEqual({ min: 50, avg: 50, max: 50, jitter: 0 });
  });
  it('computes min/avg/max', () => {
    expect(computeStats([10, 20, 60])).toMatchObject({ min: 10, max: 60, avg: 30 });
  });
  it('jitter = mean of consecutive abs diffs', () => {
    // diffs: |30-10|=20, |10-30|=20, |40-10|=30 -> mean (20+20+30)/3 = 23.33 -> 23
    expect(computeStats([10, 30, 10, 40]).jitter).toBe(23);
  });
  it('rounds avg + jitter to integers', () => {
    expect(computeStats([10, 11]).avg).toBe(11); // 10.5 -> 11
  });
});
