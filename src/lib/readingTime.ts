// One definition of reading time for the note page and the list cards (ADR-042, ADR-049).
// Assumed reading speed. No source; every label says "about".
const WORDS_PER_MINUTE = 230;

export function countMinutes(markdown: string): number {
  const words = markdown.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

// The note page drops the leading "# Title" line before it counts, so the cards do the same.
export const noteMinutes = (markdown: string) => countMinutes(markdown.replace(/^# .*\n+/, ''));
