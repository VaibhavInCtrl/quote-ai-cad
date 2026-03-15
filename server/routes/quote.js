import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const router = express.Router();

const SYSTEM_PROMPT =
  "You are a manufacturing engineer with deep expertise in CNC machining, 3D printing, sheet metal fabrication, and injection molding. Analyze the supplied geometry and produce a realistic, concise manufacturing quote estimate. Prefer practical, manufacturable recommendations. Keep price and lead time ranges credible for prototype and low-volume production.";

const QUOTE_TOOL = {
  name: "submit_quote_estimate",
  description:
    "Return the final manufacturing quote estimate using the required structured schema.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      recommended_processes: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            rank: { type: "integer" },
            name: { type: "string" },
            suitability_reason: { type: "string" },
          },
          required: ["rank", "name", "suitability_reason"],
        },
      },
      material_suggestions: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            process: { type: "string" },
            materials: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  pros: {
                    type: "array",
                    minItems: 2,
                    items: { type: "string" },
                  },
                  cons: {
                    type: "array",
                    minItems: 2,
                    items: { type: "string" },
                  },
                },
                required: ["name", "pros", "cons"],
              },
            },
          },
          required: ["process", "materials"],
        },
      },
      estimated_price_usd: {
        type: "object",
        additionalProperties: false,
        properties: {
          min: { type: "number" },
          max: { type: "number" },
        },
        required: ["min", "max"],
      },
      estimated_lead_time_days: {
        type: "object",
        additionalProperties: false,
        properties: {
          min: { type: "number" },
          max: { type: "number" },
        },
        required: ["min", "max"],
      },
      complexity_rating: {
        type: "object",
        additionalProperties: false,
        properties: {
          level: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          justification: { type: "string" },
        },
        required: ["level", "justification"],
      },
      design_for_manufacturing_tips: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
    },
    required: [
      "recommended_processes",
      "material_suggestions",
      "estimated_price_usd",
      "estimated_lead_time_days",
      "complexity_rating",
      "design_for_manufacturing_tips",
    ],
  },
};

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing.");
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function getModel() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
}

function coerceNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function coerceStringArray(value, fallback = []) {
  return Array.isArray(value)
    ? value
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
    : fallback;
}

function sanitizeQuote(rawQuote) {
  if (!rawQuote || typeof rawQuote !== "object") {
    throw new Error("Claude returned an empty quote payload.");
  }

  const recommendedProcesses = Array.isArray(rawQuote.recommended_processes)
    ? rawQuote.recommended_processes
        .map((process, index) => ({
          rank: Number(process?.rank) || index + 1,
          name: String(process?.name ?? "").trim(),
          suitability_reason: String(process?.suitability_reason ?? "").trim(),
        }))
        .filter((process) => process.name)
        .slice(0, 3)
    : [];

  const materialSuggestions = Array.isArray(rawQuote.material_suggestions)
    ? rawQuote.material_suggestions
        .map((group, index) => ({
          process:
            String(group?.process ?? recommendedProcesses[index]?.name ?? "").trim(),
          materials: Array.isArray(group?.materials)
            ? group.materials
                .map((material) => ({
                  name: String(material?.name ?? "").trim(),
                  pros: coerceStringArray(material?.pros).slice(0, 4),
                  cons: coerceStringArray(material?.cons).slice(0, 4),
                }))
                .filter((material) => material.name)
                .slice(0, 3)
            : [],
        }))
        .filter((group) => group.process)
        .slice(0, 3)
    : [];

  const estimatedPrice = {
    min: coerceNumber(rawQuote.estimated_price_usd?.min),
    max: coerceNumber(rawQuote.estimated_price_usd?.max),
  };
  const estimatedLeadTime = {
    min: coerceNumber(rawQuote.estimated_lead_time_days?.min),
    max: coerceNumber(rawQuote.estimated_lead_time_days?.max),
  };

  if (estimatedPrice.max < estimatedPrice.min) {
    [estimatedPrice.min, estimatedPrice.max] = [
      estimatedPrice.max,
      estimatedPrice.min,
    ];
  }

  if (estimatedLeadTime.max < estimatedLeadTime.min) {
    [estimatedLeadTime.min, estimatedLeadTime.max] = [
      estimatedLeadTime.max,
      estimatedLeadTime.min,
    ];
  }

  const complexityLevel = String(
    rawQuote.complexity_rating?.level ?? "medium",
  ).toLowerCase();
  const complexity_rating = {
    level: ["low", "medium", "high"].includes(complexityLevel)
      ? complexityLevel
      : "medium",
    justification: String(rawQuote.complexity_rating?.justification ?? "").trim(),
  };

  const designTips = coerceStringArray(
    rawQuote.design_for_manufacturing_tips,
  ).slice(0, 3);

  if (!recommendedProcesses.length) {
    throw new Error("Claude did not return any recommended processes.");
  }

  return {
    recommended_processes: recommendedProcesses,
    material_suggestions: materialSuggestions,
    estimated_price_usd: estimatedPrice,
    estimated_lead_time_days: estimatedLeadTime,
    complexity_rating,
    design_for_manufacturing_tips:
      designTips.length === 3
        ? designTips
        : [
            "Reduce unnecessary thin walls and unsupported features to widen process options.",
            "Standardize fillets, holes, and radii where possible to reduce setup complexity.",
            "Call out functional tolerances only where needed to avoid unnecessary cost.",
          ],
  };
}

function extractToolQuote(message) {
  const toolBlock = message.content.find(
    (block) => block.type === "tool_use" && block.name === QUOTE_TOOL.name,
  );

  if (!toolBlock) {
    throw new Error("Claude did not return structured tool output.");
  }

  return sanitizeQuote(toolBlock.input);
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
      model: getModel(),
      max_tokens: 1400,
      temperature: 0.1,
      system: SYSTEM_PROMPT,
      tools: [QUOTE_TOOL],
      tool_choice: {
        type: "tool",
        name: QUOTE_TOOL.name,
        disable_parallel_tool_use: true,
      },
      messages: [
        {
          role: "user",
          content: `Part geometry JSON:
${JSON.stringify(geometry, null, 2)}

Use the provided tool to return the final quote estimate.

Guidance:
- Recommend 2 or 3 processes ranked from best to weaker fit.
- Keep materials aligned to each recommended process.
- Assume prototype or low-volume sourcing.
- Price and lead-time ranges should be realistic, not optimistic.`,
        },
      ],
    });

    const quote = extractToolQuote(message);

    return res.json({
      quote,
      usage: message.usage,
      model: message.model,
    });
  } catch (error) {
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
