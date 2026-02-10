// Analytics API Routes
// Handles token usage tracking and instructor dashboard analytics

import { Hono } from "hono";
import { dbOps } from "../db/client";

const app = new Hono();

// GET /api/analytics/tokens/:assessmentId
// Get token usage for a specific assessment
app.get("/tokens/:assessmentId", async (c) => {
  try {
    const assessmentId = c.req.param("assessmentId");

    const tokenUsage = await dbOps.getTokenUsage(assessmentId);

    // Calculate summary statistics
    const summary = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCalls: tokenUsage.length,
      estimatedCostUSD: 0,
      byCallType: {} as Record<
        string,
        {
          calls: number;
          inputTokens: number;
          outputTokens: number;
        }
      >,
    };

    tokenUsage.forEach((record) => {
      summary.totalInputTokens += record.input_tokens;
      summary.totalOutputTokens += record.output_tokens;

      if (!summary.byCallType[record.call_type]) {
        summary.byCallType[record.call_type] = {
          calls: 0,
          inputTokens: 0,
          outputTokens: 0,
        };
      }

      summary.byCallType[record.call_type].calls++;
      summary.byCallType[record.call_type].inputTokens += record.input_tokens;
      summary.byCallType[record.call_type].outputTokens += record.output_tokens;
    });

    // Calculate cost (Claude Sonnet 4 pricing)
    const INPUT_PRICE_PER_MTok = 3.0;
    const OUTPUT_PRICE_PER_MTok = 15.0;

    summary.estimatedCostUSD =
      (summary.totalInputTokens / 1_000_000) * INPUT_PRICE_PER_MTok +
      (summary.totalOutputTokens / 1_000_000) * OUTPUT_PRICE_PER_MTok;

    return c.json({
      summary,
      details: tokenUsage,
    });
  } catch (error) {
    console.error("Error fetching token usage:", error);
    return c.json({ error: "Failed to fetch token usage" }, 500);
  }
});

// GET /api/analytics/session/:sessionId
// Get detailed analytics for a session
app.get("/session/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");

    const assessment = await dbOps.getAssessment(sessionId);
    if (!assessment) {
      return c.json({ error: "Assessment not found" }, 404);
    }

    const responses = await dbOps.getQuestionResponses(sessionId);
    const dimensionStates = await dbOps.getDimensionStates(sessionId);
    const result = await dbOps.getAssessmentResult(sessionId);

    return c.json({
      assessment,
      responses,
      dimensionStates,
      result,
    });
  } catch (error) {
    console.error("Error fetching session analytics:", error);
    return c.json({ error: "Failed to fetch session analytics" }, 500);
  }
});

export default app;
