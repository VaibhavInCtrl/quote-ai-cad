import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const router = express.Router();

const SYSTEM_PROMPT =
  "You are a manufacturing engineer with deep expertise in CNC machining, 3D printing, sheet metal fabrication, and injection molding. Given the geometry stats of a CAD part, return a JSON quote estimate. Include: recommended_processes (array of 2-3 manufacturing methods ranked by suitability), material_suggestions (array of 3 materials per process with pros/cons), estimated_price_usd (object with min/max range), estimated_lead_time_days (object with min/max), complexity_rating (low/medium/high with justification), and design_for_manufacturing_tips (array of 3 actionable tips). Return ONLY valid JSON, no markdown.";

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing.");
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function extractJson(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Model response did not include valid JSON.");
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

function validateGeometry(geometry) {
  if (!geometry || typeof geometry !== "object") {
    throw new Error("A geometry payload is required.");
  }

  if (!geometry.dimensions_mm || !geometry.triangle_count) {
    throw new Error("Geometry payload is missing parsed STL statistics.");
  }
}

router.post("/", async (req, res, next) => {
  try {
    const { geometry } = req.body;
    validateGeometry(geometry);

    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1400,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Part geometry JSON:
${JSON.stringify(geometry, null, 2)}

Return JSON with this exact shape:
{
  "recommended_processes": [
    {
      "rank": 1,
      "name": "Process name",
      "suitability_reason": "Why it fits this part"
    }
  ],
  "material_suggestions": [
    {
      "process": "Process name",
      "materials": [
        {
          "name": "Material name",
          "pros": ["pro 1", "pro 2"],
          "cons": ["con 1", "con 2"]
        }
      ]
    }
  ],
  "estimated_price_usd": {
    "min": 0,
    "max": 0
  },
  "estimated_lead_time_days": {
    "min": 0,
    "max": 0
  },
  "complexity_rating": {
    "level": "low | medium | high",
    "justification": "short explanation"
  },
  "design_for_manufacturing_tips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ]
}`,
        },
      ],
    });

    const responseText = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const quote = extractJson(responseText);

    return res.json({
      quote,
      usage: message.usage,
      model: message.model,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return next({
        statusCode: 502,
        message: "Claude returned malformed JSON.",
      });
    }

    return next({
      statusCode: error?.status ?? 500,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate manufacturing quote.",
    });
  }
});

export default router;
