import fs from "node:fs";
import path from "node:path";

const PROMPT_PATH = path.join(
  process.cwd(),
  "eval",
  "graders",
  "rubric-anthropic.prompt.txt"
);
const RESPONSE_SCHEMA_PATH = path.join(
  process.cwd(),
  "eval",
  "graders",
  "rubric-response.schema.json"
);

function loadPromptTemplate() {
  return fs.readFileSync(PROMPT_PATH, "utf8");
}

function loadSchema() {
  return JSON.parse(fs.readFileSync(RESPONSE_SCHEMA_PATH, "utf8"));
}

function buildRubricPrompt(template, task, assistantText) {
  return template
    .replace("{{task_message}}", String(task.message || ""))
    .replace("{{rubric}}", String(task.rubric || ""))
    .replace("{{assistant_text}}", String(assistantText || ""));
}

function extractJsonObject(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  const jsonSlice = start >= 0 && end > start ? text.slice(start, end + 1) : text;
  return JSON.parse(jsonSlice);
}

function validateRubricResponse(parsed) {
  const schema = loadSchema();
  const allowed = new Set(Object.keys(schema.properties || {}));
  if (typeof parsed !== "object" || parsed == null) {
    throw new Error("Rubric grader response is not an object.");
  }
  for (const key of schema.required || []) {
    if (!(key in parsed)) {
      throw new Error(`Rubric grader response missing required key: ${key}`);
    }
  }
  for (const key of Object.keys(parsed)) {
    if (!allowed.has(key)) {
      throw new Error(`Rubric grader response has unexpected key: ${key}`);
    }
  }
  if (!["pass", "fail"].includes(parsed.verdict)) {
    throw new Error("Rubric grader verdict must be 'pass' or 'fail'.");
  }
  if (typeof parsed.score !== "number") {
    throw new Error("Rubric grader score must be numeric.");
  }
  if (typeof parsed.reason !== "string") {
    throw new Error("Rubric grader reason must be string.");
  }
}

async function gradeRubricWithAnthropic(client, model, task, assistantText) {
  const template = loadPromptTemplate();
  const graderPrompt = buildRubricPrompt(template, task, assistantText);

  const resp = await client.messages.create({
    model,
    max_tokens: 300,
    messages: [{ role: "user", content: graderPrompt }],
  });

  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join(" ")
    .trim();

  const parsed = extractJsonObject(text);
  validateRubricResponse(parsed);
  const score = Math.max(0, Math.min(10, parsed.score));

  return {
    applicable: true,
    pass: parsed.verdict === "pass",
    score,
    reason: parsed.reason,
    skipped: false,
  };
}

export async function evaluateRubric(task, assistantText, graderCfg) {
  if (!task.rubric) {
    return {
      applicable: false,
      pass: true,
      score: null,
      reason: null,
      skipped: true,
    };
  }

  if (graderCfg.grader === "none") {
    return {
      applicable: false,
      pass: true,
      score: null,
      reason: "Rubric present but grader disabled (--grader none).",
      skipped: true,
    };
  }

  if (graderCfg.grader === "anthropic") {
    if (!graderCfg.clients.anthropic) {
      return {
        applicable: true,
        pass: false,
        score: 0,
        reason: "Rubric present but ANTHROPIC_API_KEY is missing for grader.",
        skipped: true,
      };
    }
    try {
      return await gradeRubricWithAnthropic(
        graderCfg.clients.anthropic,
        graderCfg.graderModel,
        task,
        assistantText
      );
    } catch (error) {
      return {
        applicable: true,
        pass: false,
        score: 0,
        reason: `Rubric grader error: ${error instanceof Error ? error.message : String(error)}`,
        skipped: false,
      };
    }
  }

  return {
    applicable: true,
    pass: false,
    score: 0,
    reason: `Unsupported grader: ${graderCfg.grader}`,
    skipped: true,
  };
}
