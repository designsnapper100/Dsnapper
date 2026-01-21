import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { jsonrepair } from "npm:jsonrepair";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-api-key", "anthropic-version"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Improved JSON extraction and parsing using jsonrepair
function safeParseAIResponse(text: string) {
  try {
    if (!text) return null;
    
    // 1. Extract potential JSON content
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === 0) return null;
    
    const jsonString = text.slice(jsonStart, jsonEnd);
    
    // 2. Attempt standard parse first for speed
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      // 3. Use jsonrepair for malformed AI output
      try {
        const repaired = jsonrepair(jsonString);
        return JSON.parse(repaired);
      } catch (repairError) {
        console.error("JSON repair failed:", repairError);
        // Fallback: log a snippet for debugging
        console.log("Context near error:", jsonString.slice(0, 100) + "..." + jsonString.slice(-100));
        return null;
      }
    }
  } catch (err) {
    console.error("Critical parsing error:", err);
    return null;
  }
}

app.get("/make-server-cdc57b20/health", (c) => c.json({ status: "ok" }));

app.post("/make-server-cdc57b20/share", async (c) => {
  try {
    const reportData = await c.req.json();
    const shareId = crypto.randomUUID();
    const key = `report_${shareId}`;
    await kv.set(key, { ...reportData, createdAt: new Date().toISOString() });
    return c.json({ shareId });
  } catch (error) {
    return c.json({ error: "Failed to share report" }, 500);
  }
});

app.get("/make-server-cdc57b20/share/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const report = await kv.get(`report_${id}`);
    if (!report) return c.json({ error: "Report not found" }, 404);
    return c.json(report);
  } catch (error) {
    return c.json({ error: "Failed to retrieve report" }, 500);
  }
});

app.post("/make-server-cdc57b20/analyze", async (c) => {
  try {
    const { image, context } = await c.req.json();
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    const base64Data = image.split(',')[1] || image;
    const mediaType = image.split(';')[0].split(':')[1] || 'image/png';

    const anthropicModels = [
      "claude-3-5-sonnet-latest",
      "claude-3-5-sonnet-20240620",
      "claude-3-haiku-20240307"
    ];

    if (anthropicKey) {
      for (const modelName of anthropicModels) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout per model

          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": anthropicKey,
              "anthropic-version": "2023-06-01"
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: modelName,
              max_tokens: 2500,
              temperature: 0,
              system: `You are an elite Visual Quality Assurance (VQA) specialist and Accessibility Auditor. Your task is to perform a rigorous analysis of UI designs specifically for structural and standard-compliant flaws.

SCOPE OF WORK:
Only report issues that fall into these four categories:
1. UI Spacing & Alignment: Inconsistent margins, misaligned text/elements, or cramped layouts.
2. Visual Hierarchy: Unclear focal points, inappropriate sizing of headings vs body, or confusing element stacking.
3. Contrast & Accessibility (WCAG 2.1): Text or UI components failing AA/AAA contrast ratios, or missing clear interactive indicators.
4. Professional UI Standards: Violations of common design patterns (e.g., inconsistent corner radii, broken grids).

STRICT NEGATIVE CONSTRAINTS:
- DO NOT report subjective "style" preferences.
- DO NOT report issues that are not clearly visible in the static screenshot.
- DO NOT invent "minor" issues just to fill a quota. If a design is high quality, report fewer (or zero) issues.
- AIM for high precision over high volume.

CRITICAL: 
1. Respond ONLY with a valid JSON object.
2. Use single quotes inside string values for emphasis.
3. Coordinates (x, y) must be 0-100.
              
              JSON Format:
              {
                "designType": "UX",
                "annotations": [
                  {
                    "id": number,
                    "x": number,
                    "y": number,
                    "type": "accessibility" | "usability" | "consistency" | "visual",
                    "severity": "critical" | "minor",
                    "title": string,
                    "description": string,
                    "fix": string
                  }
                ]
              }`,
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
                    { type: "text", text: `Audit this UI. ${context || ""}` }
                  ],
                },
              ],
            }),
          });

          clearTimeout(timeoutId);
          const data = await response.json();
          if (response.ok && data.content) {
            const parsed = safeParseAIResponse(data.content[0].text);
            if (parsed) return c.json({ ...parsed, mode: 'ai', modelUsed: modelName });
          }
        } catch (e) { 
          console.warn(`Model ${modelName} failed or timed out:`, e.name);
          continue; 
        }
      }
    }

    // OpenAI Fallback with timeout
    if (openaiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { 
                role: "system", 
                content: `You are a strict UI/UX Visual QA auditor. 
                ONLY report issues related to:
                1. Spacing & Alignment (inconsistent padding, misalignment).
                2. Visual Hierarchy (incorrect sizing, focal point confusion).
                3. Contrast & WCAG 2.1 (accessibility failures).
                
                IGNORE subjective style or content. If the design is perfect, return an empty annotations array.
                Use single quotes inside string values. Return JSON ONLY.` 
              },
              { role: "user", content: [{ type: "image_url", image_url: { url: image } }] }
            ],
            response_format: { type: "json_object" }
          }),
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        if (response.ok) {
          const parsed = safeParseAIResponse(data.choices[0].message.content);
          if (parsed) return c.json({ ...parsed, mode: 'ai', modelUsed: 'gpt-4o' });
        }
      } catch (e) { 
        console.warn("OpenAI fallback failed or timed out:", e.name);
      }
    }

    return c.json({ mode: 'simulated', annotations: [] });
  } catch (error) {
    return c.json({ error: "Server error" }, 500);
  }
});

Deno.serve(app.fetch);
