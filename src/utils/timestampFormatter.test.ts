import { describe, it, expect } from 'vitest';
import { formatStoryTimestamp, type StoryTimestamp } from './timestampFormatter';

// Helper to build expected formatted string based on LOCAL time components
const buildExpected = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `Story-${y}-${m}-${d}-${hh}-${mm}-${ss}`;
};

describe('formatStoryTimestamp', () => {
  it('should format date correctly with example from requirements (local time)', () => {
    const date = new Date('2025-08-31T18:45:30.000Z');
    const result = formatStoryTimestamp(date);
    expect(result.formatted).toBe(buildExpected(date));
    expect(result.originalDate).toBe(date);
  });

  it('should format date with zero-padding for single digit values', () => {
    const date = new Date('2025-01-05T09:07:03.000Z');
    const result = formatStoryTimestamp(date);
    expect(result.formatted).toBe(buildExpected(date));
    expect(result.originalDate).toBe(date);
  });

  it('should handle leap year dates correctly', () => {
    const date = new Date('2024-02-29T12:00:00.000Z');
    const result = formatStoryTimestamp(date);
    expect(result.formatted).toBe(buildExpected(date));
    expect(result.originalDate).toBe(date);
  });

  it('should handle end of year date', () => {
    const date = new Date('2024-12-31T23:59:59.000Z');
    const result = formatStoryTimestamp(date);
    expect(result.formatted).toBe(buildExpected(date));
    expect(result.originalDate).toBe(date);
  });

  it('should handle beginning of year date', () => {
    const date = new Date('2025-01-01T00:00:00.000Z');
    const result = formatStoryTimestamp(date);
    expect(result.formatted).toBe(buildExpected(date));
    expect(result.originalDate).toBe(date);
  });

  it('should return StoryTimestamp interface with correct structure', () => {
    const date = new Date('2025-06-15T14:30:45.000Z');
    const result: StoryTimestamp = formatStoryTimestamp(date);

    expect(typeof result).toBe('object');
    expect(typeof result.formatted).toBe('string');
    expect(result.originalDate).toBeInstanceOf(Date);
    expect(result.formatted.startsWith('Story-')).toBe(true);
  });

  it('should handle current date consistently', () => {
    const now = new Date();
    const result = formatStoryTimestamp(now);

    // Verify format structure
    expect(result.formatted).toMatch(/^Story-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/);
    expect(result.originalDate).toBe(now);
  });

  it('should maintain date reference integrity', () => {
    const date = new Date('2025-03-15T10:20:30.000Z');
    const result = formatStoryTimestamp(date);

    // Original date should not be modified
    expect(result.originalDate).toBe(date);
    expect(result.originalDate.getTime()).toBe(date.getTime());
  });

  it('should handle different timezones consistently (based on local time)', () => {
    const utcDate = new Date('2025-07-04T16:30:25.000Z');
    const result = formatStoryTimestamp(utcDate);
    expect(result.formatted).toBe(buildExpected(utcDate));
  });
});