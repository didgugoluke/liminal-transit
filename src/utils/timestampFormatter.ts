/**
 * Story timestamp formatting utility
 * Provides consistent timestamp formatting for the story system
 */

export interface StoryTimestamp {
  formatted: string;
  originalDate: Date;
}

/**
 * Formats a date for story system timestamps
 * @param date - The date to format
 * @returns StoryTimestamp object with formatted string and original date
 * @example
 * ```typescript
 * const timestamp = formatStoryTimestamp(new Date('2025-08-31T18:45:30.000Z'));
 * console.log(timestamp.formatted); // "Story-2025-08-31-18-45-30"
 * ```
 */
export function formatStoryTimestamp(date: Date): StoryTimestamp {
  // Extract date components with zero-padding
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Format as "Story-YYYY-MM-DD-HH-mm-ss"
  const formatted = `Story-${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;

  return {
    formatted,
    originalDate: date,
  };
}