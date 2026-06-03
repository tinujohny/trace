import type { Claim, MessageEvaluation } from "@/types";
import { FIXTURE_SESSIONS } from "./sessions";

/** Match assistant text to a fixture evaluation; remap ids to the live message. */
export function getFixtureEvaluationForContent(
  content: string,
  messageId: string,
): MessageEvaluation | null {
  const normalized = normalizeContent(content);

  for (const session of FIXTURE_SESSIONS) {
    const assistant = session.messages.find((m) => m.role === "assistant");
    if (!assistant) continue;

    if (normalizeContent(assistant.content) !== normalized) continue;

    const fixtureEval = session.evaluations.find((e) => e.messageId === assistant.id);
    if (!fixtureEval) continue;

    return remapEvaluation(fixtureEval, messageId);
  }

  return null;
}

export function remapEvaluation(
  evaluation: MessageEvaluation,
  messageId: string,
): MessageEvaluation {
  return {
    messageId,
    claims: evaluation.claims.map((claim) => remapClaim(claim, messageId)),
  };
}

function remapClaim(claim: Claim, messageId: string): Claim {
  return {
    ...claim,
    id: `${messageId}-${claim.id}`,
    messageId,
  };
}

function normalizeContent(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
