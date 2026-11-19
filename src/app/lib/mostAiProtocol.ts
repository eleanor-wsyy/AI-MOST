import type { MostChoice } from './mostResponses';
import type { MostLocalAiCondition } from './mostLocalTrials';

export type ParsedMostAiReply = {
  valid: boolean;
  choice: MostChoice | null;
  predictedA: number | null;
  predictedB: number | null;
  predictedTie: number | null;
  scoresA: number[] | null;
  scoresB: number[] | null;
  scoreA: number | null;
  scoreB: number | null;
};

function emptyReply(): ParsedMostAiReply {
  return { valid: false, choice: null, predictedA: null, predictedB: null, predictedTie: null, scoresA: null, scoresB: null, scoreA: null, scoreB: null };
}

export function parseMostAiReply(reply: string, condition: MostLocalAiCondition): ParsedMostAiReply {
  const cleaned = reply.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as { choice?: unknown; predicted_a_count?: unknown; predicted_b_count?: unknown; predicted_tie_count?: unknown; scores_a?: unknown; scores_b?: unknown };
    const responseChoice: MostChoice | null = parsed.choice === 'A' || parsed.choice === 'B' || parsed.choice === 'tie' ? parsed.choice : null;
    const counts = [parsed.predicted_a_count, parsed.predicted_b_count, parsed.predicted_tie_count];
    const validCounts = counts.every(value => typeof value === 'number' && Number.isInteger(value) && value >= 0) && counts.reduce<number>((sum, value) => sum + Number(value), 0) === 100;
    const predictedA = validCounts ? Number(parsed.predicted_a_count) : null;
    const predictedB = validCounts ? Number(parsed.predicted_b_count) : null;
    const predictedTie = validCounts ? Number(parsed.predicted_tie_count) : null;
    const readScores = (value: unknown) => Array.isArray(value) && value.length === 15 && value.every(score => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 1) ? value as number[] : null;
    const scoresA = condition === 'ls15' ? readScores(parsed.scores_a) : null;
    const scoresB = condition === 'ls15' ? readScores(parsed.scores_b) : null;
    const sumScores = (scores: number[] | null) => scores === null ? null : Math.round(scores.reduce((sum, score) => sum + score, 0) * 1_000_000) / 1_000_000;
    const scoreA = sumScores(scoresA);
    const scoreB = sumScores(scoresB);
    const choice: MostChoice | null = condition === 'pred'
      ? validCounts
        ? predictedA! > predictedB! && predictedA! > predictedTie! ? 'A' : predictedB! > predictedA! && predictedB! > predictedTie! ? 'B' : predictedTie! > predictedA! && predictedTie! > predictedB! ? 'tie' : null
        : null
      : condition === 'ls15'
        ? scoreA === null || scoreB === null ? null : scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie'
        : responseChoice;
    const valid = condition === 'pred' ? validCounts : condition === 'ls15' ? scoresA !== null && scoresB !== null : responseChoice !== null;
    return { valid, choice, predictedA, predictedB, predictedTie, scoresA, scoresB, scoreA, scoreB };
  } catch {
    return emptyReply();
  }
}

export function mapMostAiReplyToSourceOrder(result: ParsedMostAiReply, swapped: boolean): ParsedMostAiReply {
  if (!swapped) return result;
  const choice: MostChoice | null = result.choice === 'A' ? 'B' : result.choice === 'B' ? 'A' : result.choice;
  return { ...result, choice, predictedA: result.predictedB, predictedB: result.predictedA, scoresA: result.scoresB, scoresB: result.scoresA, scoreA: result.scoreB, scoreB: result.scoreA };
}
