export interface ParsedReport {
  initiativeName: string;
  personDays: number;
  note: string | null;
}

export interface ParseError {
  error: string;
}

export type ParseResult = ParsedReport | ParseError;

// Match patterns like: 0.5d, 1d, 2.5d, 0,5d (comma decimal), 0.5 days
// Using \b word boundary to ensure we match complete numbers
const DAYS_PATTERN = /\b(\d+(?:[.,]\d+)?)\s*d(?:ays?)?\b/i;

export function parseReportCommand(text: string): ParseResult {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return {
      error:
        'Usage: /report "Initiative Name" 0.5d What you worked on\n' +
        "Example: /report \"AI Experimentation\" 1d Tested prompt engineering",
    };
  }

  let initiativeName: string;
  let remainingText: string;

  if (trimmedText.startsWith('"')) {
    const closingQuoteIndex = trimmedText.indexOf('"', 1);
    if (closingQuoteIndex === -1) {
      return { error: "Missing closing quote for initiative name" };
    }
    initiativeName = trimmedText.slice(1, closingQuoteIndex);
    remainingText = trimmedText.slice(closingQuoteIndex + 1).trim();
  } else {
    const firstSpaceIndex = trimmedText.indexOf(" ");
    if (firstSpaceIndex === -1) {
      return {
        error:
          "Please specify time spent. Example: /report \"AI Experimentation\" 0.5d",
      };
    }
    initiativeName = trimmedText.slice(0, firstSpaceIndex);
    remainingText = trimmedText.slice(firstSpaceIndex + 1).trim();
  }

  if (!initiativeName) {
    return { error: "Initiative name cannot be empty" };
  }

  const daysMatch = remainingText.match(DAYS_PATTERN);
  if (!daysMatch) {
    return {
      error:
        'Please specify time in days (e.g., 0.5d, 1d, 2d). Example: /report "AI Experimentation" 0.5d',
    };
  }

  // Handle both period and comma as decimal separators
  const personDays = parseFloat(daysMatch[1]!.replace(",", "."));
  if (isNaN(personDays) || personDays <= 0 || personDays > 5) {
    return { error: "Person-days must be between 0 and 5" };
  }

  const noteStartIndex =
    remainingText.indexOf(daysMatch[0]) + daysMatch[0].length;
  const note = remainingText.slice(noteStartIndex).trim() || null;

  return {
    initiativeName,
    personDays,
    note,
  };
}
