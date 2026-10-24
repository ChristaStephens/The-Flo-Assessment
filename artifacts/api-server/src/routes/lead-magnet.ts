import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { db, tymfloFlowScoreSubmissions } from "@workspace/db";
import {
  SubmitFlowScoreBody,
  SubmitFlowScoreResponse,
} from "@workspace/api-zod";
import { createFlowScoreAirtableRecord } from "../lib/airtable-flow-score";

const router: IRouter = Router();

const OPPORTUNITIES = [
  {
    name: "Proposals & Documents",
    message: "Templates are a start. The next opportunity is helping information move into proposals, reports, and intake documents without rebuilding them each time.",
  },
  {
    name: "Scheduling",
    message: "Back-and-forth scheduling can quietly consume a week. A smoother booking and reminder flow can give that time back to you and your clients.",
  },
  {
    name: "Connecting Your Systems",
    message: "Repeated copying is a signal that your tools are not sharing the work. Connecting the right steps can reduce errors and keep information moving.",
  },
  {
    name: "Client Follow-Up",
    message: "Important follow-up should not depend on someone remembering. A reliable flow can keep clients informed while giving your team fewer loose ends.",
  },
  {
    name: "Business Visibility",
    message: "When answers live in several places, even a quick status check becomes work. Better visibility can help you see what needs attention without hunting for it.",
  },
] as const;

function scoreCopy(score: number) {
  if (score <= 3) {
    return {
      level: "needs-relief" as const,
      headline: "Your business is working harder than it needs to.",
      message: "A lot of the day still depends on remembering, copying, checking, and manually keeping things moving. That means there are real opportunities to give some of that time back.",
    };
  }
  if (score <= 7) {
    return {
      level: "gaining-flow" as const,
      headline: "You’ve got things moving.",
      message: "You already have useful systems in place, but a few repeated steps or disconnected tools may still be creating more work than necessary.",
    };
  }
  return {
    level: "flowing-strong" as const,
    headline: "Your business has a strong flow.",
    message: "Most work is moving well. Your next opportunity may be connecting what already works, improving visibility, or applying technology where it can make the biggest difference.",
  };
}

router.post("/lead-magnet/submissions", async (req, res): Promise<void> => {
  const parsed = SubmitFlowScoreBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid Flow Score submission");
    res.status(400).json({ error: "Please review your answers and contact details." });
    return;
  }

  const input = parsed.data;
  const email = input.email.trim().toLowerCase();
  const answersAreValid = input.answers.every((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 2);
  if (
    !answersAreValid ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !input.acceptedTerms ||
    !input.acceptedPrivacy
  ) {
    res.status(400).json({ error: "A valid email and acceptance of the Terms and Privacy Notice are required." });
    return;
  }

  const score = input.answers.reduce((total, answer) => total + answer, 0);
  const lowestAnswer = Math.min(...input.answers);
  const opportunityIndex = input.answers.findIndex((answer) => answer === lowestAnswer);
  const opportunity = OPPORTUNITIES[opportunityIndex] ?? OPPORTUNITIES[0];
  const copy = scoreCopy(score);
  const submissionId = `flow-${randomUUID()}`;
  const name = input.name.trim();

  try {
    await createFlowScoreAirtableRecord({
      name,
      email,
      score,
      scoreDescription: `${copy.headline}\n\n${copy.message}`,
      answers: input.answers,
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to save Flow Score submission to Airtable");
    res.status(502).json({ error: "We couldn't save your result. Please try again." });
    return;
  }

  await db.insert(tymfloFlowScoreSubmissions).values({
    id: submissionId,
    name,
    email,
    phone: input.phone?.trim() || null,
    businessName: input.businessName?.trim() || null,
    industry: input.industry?.trim() || null,
    answers: input.answers,
    score,
    opportunity: opportunity.name,
    acceptedTerms: input.acceptedTerms,
    acceptedPrivacy: input.acceptedPrivacy,
    marketingConsent: input.marketingConsent,
    giveawayOptIn: input.giveawayOptIn,
  });

  res.status(201).json(SubmitFlowScoreResponse.parse({
    submissionId,
    score,
    ...copy,
    opportunity: opportunity.name,
    opportunityMessage: opportunity.message,
  }));
});

export default router;