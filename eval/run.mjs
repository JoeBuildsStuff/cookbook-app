#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { evaluateRubric } from "./graders/index.mjs";

function parseBool(value, defaultValue = false) {
  if (value == null) return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return defaultValue;
}

function parseArgs(argv) {
  const args = {
    provider: "all",
    tasks: "eval/tasks",
    split: "all",
    prompts: "eval/prompts",
    tools: "eval/tools",
    out: "",
    thresholds: "eval/thresholds/default.json",
    baseline: "",
    grader: "anthropic",
    graderModel: "claude-sonnet-4-6",
    failOnGateFail: false,
    requireRuns: false,
    modelAnthropic: "claude-sonnet-4-6",
    modelOpenAI: "gpt-5",
    modelCerebras: "gpt-oss-120b",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) continue;

    switch (key) {
      case "--provider":
        args.provider = value || args.provider;
        i += 1;
        break;
      case "--tasks":
        args.tasks = value || args.tasks;
        i += 1;
        break;
      case "--split":
        args.split = value || args.split;
        i += 1;
        break;
      case "--prompts":
        args.prompts = value || args.prompts;
        i += 1;
        break;
      case "--tools":
        args.tools = value || args.tools;
        i += 1;
        break;
      case "--out":
        args.out = value || args.out;
        i += 1;
        break;
      case "--thresholds":
        args.thresholds = value || args.thresholds;
        i += 1;
        break;
      case "--baseline":
        args.baseline = value || args.baseline;
        i += 1;
        break;
      case "--grader":
        args.grader = value || args.grader;
        i += 1;
        break;
      case "--grader-model":
        args.graderModel = value || args.graderModel;
        i += 1;
        break;
      case "--fail-on-gate-fail":
        args.failOnGateFail = parseBool(value, true);
        i += 1;
        break;
      case "--require-runs":
        args.requireRuns = parseBool(value, true);
        i += 1;
        break;
      case "--model-anthropic":
        args.modelAnthropic = value || args.modelAnthropic;
        i += 1;
        break;
      case "--model-openai":
        args.modelOpenAI = value || args.modelOpenAI;
        i += 1;
        break;
      case "--model-cerebras":
        args.modelCerebras = value || args.modelCerebras;
        i += 1;
        break;
      default:
        break;
    }
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listByExtension(targetPath, ext) {
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) return [targetPath];
  return fs
    .readdirSync(targetPath)
    .filter((f) => f.endsWith(ext))
    .map((f) => path.join(targetPath, f))
    .sort();
}

function inferSplitFromFilename(filePath) {
  const name = path.basename(filePath).toLowerCase();
  if (name.includes("heldout")) return "heldout";
  if (name.includes("train")) return "train";
  return "dev";
}

function loadTasks(tasksPath, split) {
  const files = listByExtension(tasksPath, ".json");
  const preferredNamedFiles = files.filter((file) =>
    /(train|dev|heldout)\.json$/i.test(path.basename(file))
  );
  const inputFiles =
    preferredNamedFiles.length >= 2 ? preferredNamedFiles : files;
  const all = [];

  for (const file of inputFiles) {
    const doc = readJson(file);
    const docSplit = doc.split || inferSplitFromFilename(file);
    const tasks = Array.isArray(doc.tasks) ? doc.tasks : [];
    for (const task of tasks) {
      all.push({
        ...task,
        split: task.split || docSplit,
        sourceFile: file,
      });
    }
  }

  if (split === "all") return all;
  return all.filter((task) => task.split === split);
}

function getProviders(providerArg) {
  if (providerArg === "all") return ["anthropic", "openai", "cerebras"];
  return [providerArg];
}

function buildSystemPrompt(basePrompt, task) {
  let prompt = basePrompt.trim();
  if (task.clientPath) {
    prompt += `\n\nUser Navigation Context:\n- Current path: ${task.clientPath}\n- If the path is /dashboard/recipes/{id}, use that {id} as recipeId for recipe tools.`;
  }
  return prompt;
}

function parseJsonSafely(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function normalizeAssistantContent(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part?.type === "text" && typeof part?.text === "string") {
        return part.text;
      }
      return "";
    })
    .join(" ")
    .trim();
}

function evaluateSingleToolExpected(expected, toolCalls) {
  const safeCalls = Array.isArray(toolCalls) ? toolCalls : [];

  if (!expected) {
    return {
      applicable: false,
      pass: true,
      selectedTool: safeCalls[0]?.name || null,
      expectedToolCalled: null,
      requiredArgsPresent: null,
      argEqualsMatch: null,
      noToolMatch: null,
    };
  }

  if (expected.noTool === true) {
    return {
      applicable: true,
      pass: safeCalls.length === 0,
      selectedTool: safeCalls[0]?.name || null,
      expectedToolCalled: null,
      requiredArgsPresent: null,
      argEqualsMatch: null,
      noToolMatch: safeCalls.length === 0,
    };
  }

  if (!expected.tool) {
    return {
      applicable: true,
      pass: false,
      selectedTool: safeCalls[0]?.name || null,
      expectedToolCalled: false,
      requiredArgsPresent: false,
      argEqualsMatch: false,
      noToolMatch: null,
    };
  }

  const matched = safeCalls.find((tc) => tc.name === expected.tool);
  const selected = matched || safeCalls[0] || null;
  const args = selected?.arguments || {};
  const requiredArgs = expected.requiredArgs || [];
  const argEquals = expected.argEquals || {};

  const expectedToolCalled = Boolean(matched);
  const requiredArgsPresent =
    requiredArgs.length === 0 || requiredArgs.every((key) => key in args);
  const argEqualsMatch = Object.entries(argEquals).every(
    ([key, expectedValue]) => args[key] === expectedValue
  );

  return {
    applicable: true,
    pass: expectedToolCalled && requiredArgsPresent && argEqualsMatch,
    selectedTool: selected?.name || null,
    expectedToolCalled,
    requiredArgsPresent,
    argEqualsMatch,
    noToolMatch: null,
  };
}

function evaluateTool(expected, toolCalls) {
  if (!expected) {
    return evaluateSingleToolExpected(expected, toolCalls);
  }

  if (Array.isArray(expected.anyOf) && expected.anyOf.length > 0) {
    const candidates = expected.anyOf.map((candidate) =>
      evaluateSingleToolExpected(candidate, toolCalls)
    );
    const winner = candidates.find((c) => c.pass) || candidates[0];
    return {
      ...winner,
      matchedAnyOf: candidates.some((c) => c.pass),
    };
  }

  return evaluateSingleToolExpected(expected, toolCalls);
}

function normalizeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function evaluateText(expectedText, assistantText) {
  if (!expectedText) {
    return {
      applicable: false,
      pass: true,
      includesAllPass: null,
      includesAnyPass: null,
      excludesPass: null,
      regexPass: null,
    };
  }

  const text = String(assistantText || "");
  const normalizedText = normalizeForMatch(text);

  const includesAll = expectedText.includesAll || [];
  const includesAny = expectedText.includesAny || [];
  const excludes = expectedText.excludes || [];
  const regexes = expectedText.regex || [];

  const includesAllPass = includesAll.every((needle) =>
    normalizedText.includes(normalizeForMatch(needle))
  );
  const includesAnyPass =
    includesAny.length === 0 ||
    includesAny.some((needle) => normalizedText.includes(normalizeForMatch(needle)));
  const excludesPass = excludes.every(
    (needle) => !normalizedText.includes(normalizeForMatch(needle))
  );
  const regexPass = regexes.every((pattern) => {
    try {
      return new RegExp(pattern, "i").test(text);
    } catch {
      return false;
    }
  });

  return {
    applicable: true,
    pass: includesAllPass && includesAnyPass && excludesPass && regexPass,
    includesAllPass,
    includesAnyPass,
    excludesPass,
    regexPass,
  };
}

async function callAnthropic(client, model, systemPrompt, tools, message) {
  const resp = await client.messages.create({
    model,
    max_tokens: 512,
    system: systemPrompt,
    tools,
    messages: [{ role: "user", content: message }],
  });

  const toolCalls = resp.content
    .filter((block) => block.type === "tool_use")
    .map((block) => ({
      id: block.id,
      name: block.name,
      arguments: block.input || {},
    }));

  const assistantText = resp.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join(" ")
    .trim();

  return { raw: resp, toolCalls, assistantText };
}

async function callOpenAI(client, model, systemPrompt, tools, message) {
  const openAITools = tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
    },
  }));

  const resp = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
    tools: openAITools,
    tool_choice: "auto",
  });

  const assistant = resp.choices[0]?.message;
  const toolCalls = (assistant?.tool_calls || []).map((tc) => ({
    id: tc.id,
    name: tc.function.name,
    arguments: parseJsonSafely(tc.function.arguments),
  }));

  const assistantText = normalizeAssistantContent(assistant?.content);
  return { raw: resp, toolCalls, assistantText };
}

async function callCerebras(client, model, systemPrompt, tools, message) {
  const cerebrasTools = tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description || `Tool for ${tool.name}`,
      parameters: tool.input_schema,
    },
  }));

  const resp = await client.chat.completions.create({
    model,
    stream: false,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
    tools: cerebrasTools,
  });

  const assistant = resp.choices?.[0]?.message;
  const toolCalls = (assistant?.tool_calls || []).map((tc) => ({
    id: tc.id,
    name: tc.function.name,
    arguments: parseJsonSafely(tc.function.arguments),
  }));

  const assistantText = normalizeAssistantContent(assistant?.content);
  return { raw: resp, toolCalls, assistantText };
}

async function callProvider(provider, clients, models, systemPrompt, tools, message) {
  if (provider === "anthropic") {
    return callAnthropic(
      clients.anthropic,
      models.modelAnthropic,
      systemPrompt,
      tools,
      message
    );
  }
  if (provider === "openai") {
    return callOpenAI(
      clients.openai,
      models.modelOpenAI,
      systemPrompt,
      tools,
      message
    );
  }
  return callCerebras(
    clients.cerebras,
    models.modelCerebras,
    systemPrompt,
    tools,
    message
  );
}

function ensureResultPath(outPath) {
  if (outPath) return outPath;
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  return path.join("eval", "results", `run-${stamp}.json`);
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

function pct(n, d) {
  if (!d) return 0;
  return Number(((n / d) * 100).toFixed(2));
}

function runKey(run) {
  return `${run.provider}|${run.promptFile}|${run.toolFile}`;
}

function buildBaselineMap(baselinePath) {
  if (!baselinePath) return new Map();
  const baseline = readJson(baselinePath);
  const map = new Map();
  for (const run of baseline.runs || []) {
    map.set(runKey(run), run);
  }
  return map;
}

function computeMetrics(taskResults) {
  const total = taskResults.length;
  const tasksPassed = taskResults.filter((r) => r.pass).length;

  const toolApplicable = taskResults.filter((r) => r.toolEval?.applicable);
  const toolPassed = toolApplicable.filter((r) => r.toolEval?.pass).length;

  const textApplicable = taskResults.filter((r) => r.textEval?.applicable);
  const textPassed = textApplicable.filter((r) => r.textEval?.pass).length;

  const rubricApplicable = taskResults.filter(
    (r) => r.rubricEval?.applicable && !r.rubricEval?.skipped
  );
  const rubricPassed = rubricApplicable.filter((r) => r.rubricEval?.pass).length;
  const rubricScores = rubricApplicable
    .map((r) => r.rubricEval?.score)
    .filter((v) => typeof v === "number");

  const latencies = taskResults.map((r) => r.latencyMs || 0);
  const p95LatencyMs = percentile(latencies, 95);

  return {
    tasksTotal: total,
    tasksPassed,
    successRate: pct(tasksPassed, total),
    toolAccuracy: pct(toolPassed, toolApplicable.length),
    textAccuracy: pct(textPassed, textApplicable.length),
    rubricPassRate: pct(rubricPassed, rubricApplicable.length),
    rubricAvgScore:
      rubricScores.length > 0
        ? Number(
            (
              rubricScores.reduce((sum, x) => sum + x, 0) / rubricScores.length
            ).toFixed(3)
          )
        : null,
    p95LatencyMs,
    coverage: {
      toolApplicable: toolApplicable.length,
      textApplicable: textApplicable.length,
      rubricApplicable: rubricApplicable.length,
    },
  };
}

function evaluateThresholds(metrics, thresholds, baselineRun) {
  const checks = [];
  if (typeof thresholds.minSuccessRate === "number") {
    checks.push({
      gate: "minSuccessRate",
      pass: metrics.successRate >= thresholds.minSuccessRate,
      actual: metrics.successRate,
      target: thresholds.minSuccessRate,
    });
  }
  if (typeof thresholds.minToolAccuracy === "number") {
    checks.push({
      gate: "minToolAccuracy",
      pass: metrics.toolAccuracy >= thresholds.minToolAccuracy,
      actual: metrics.toolAccuracy,
      target: thresholds.minToolAccuracy,
    });
  }
  if (
    typeof thresholds.minTextAccuracy === "number" &&
    metrics.coverage.textApplicable > 0
  ) {
    checks.push({
      gate: "minTextAccuracy",
      pass: metrics.textAccuracy >= thresholds.minTextAccuracy,
      actual: metrics.textAccuracy,
      target: thresholds.minTextAccuracy,
    });
  }
  if (
    typeof thresholds.minRubricPassRate === "number" &&
    metrics.coverage.rubricApplicable > 0
  ) {
    checks.push({
      gate: "minRubricPassRate",
      pass: metrics.rubricPassRate >= thresholds.minRubricPassRate,
      actual: metrics.rubricPassRate,
      target: thresholds.minRubricPassRate,
    });
  }
  if (typeof thresholds.maxP95LatencyMs === "number") {
    checks.push({
      gate: "maxP95LatencyMs",
      pass: metrics.p95LatencyMs <= thresholds.maxP95LatencyMs,
      actual: metrics.p95LatencyMs,
      target: thresholds.maxP95LatencyMs,
    });
  }
  if (
    baselineRun &&
    typeof thresholds.maxRegressionPct === "number" &&
    typeof baselineRun.successRate === "number"
  ) {
    const delta = Number((metrics.successRate - baselineRun.successRate).toFixed(2));
    checks.push({
      gate: "maxRegressionPct",
      pass: delta >= -Math.abs(thresholds.maxRegressionPct),
      actual: delta,
      target: -Math.abs(thresholds.maxRegressionPct),
    });
  }
  return {
    pass: checks.every((c) => c.pass),
    checks,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const providers = getProviders(args.provider);
  const promptFiles = listByExtension(args.prompts, ".txt");
  const toolFiles = listByExtension(args.tools, ".json");
  const tasks = loadTasks(args.tasks, args.split);
  const thresholds = fs.existsSync(args.thresholds)
    ? readJson(args.thresholds)
    : {};
  const baselineMap = buildBaselineMap(args.baseline);

  const clients = {
    anthropic: process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null,
    openai: process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null,
    cerebras: process.env.CEREBRAS_API_KEY
      ? new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY })
      : null,
  };

  const providerKeyChecks = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    cerebras: "CEREBRAS_API_KEY",
  };

  const runStartedAt = new Date().toISOString();
  const runs = [];

  for (const provider of providers) {
    if (!clients[provider]) {
      console.warn(
        `[skip] ${provider}: missing ${providerKeyChecks[provider]} in environment`
      );
      continue;
    }

    for (const promptFile of promptFiles) {
      const basePrompt = fs.readFileSync(promptFile, "utf8");
      for (const toolFile of toolFiles) {
        const toolDoc = readJson(toolFile);
        const tools = toolDoc.tools || [];
        const taskResults = [];

        for (const task of tasks) {
          const systemPrompt = buildSystemPrompt(basePrompt, task);
          const started = Date.now();
          try {
            const resp = await callProvider(
              provider,
              clients,
              args,
              systemPrompt,
              tools,
              task.message
            );

            const toolEval = evaluateTool(task.expected, resp.toolCalls || []);
            const textEval = evaluateText(task.expectedText, resp.assistantText || "");
            const rubricEval = await evaluateRubric(task, resp.assistantText || "", {
              grader: args.grader,
              graderModel: args.graderModel,
              clients,
            });

            const pass =
              toolEval.pass &&
              textEval.pass &&
              (!rubricEval.applicable || rubricEval.skipped || rubricEval.pass);
            taskResults.push({
              id: task.id,
              split: task.split,
              sourceFile: task.sourceFile,
              pass,
              expectedTool: task.expected?.tool || null,
              assistantText: resp.assistantText || "",
              toolCalls: resp.toolCalls || [],
              toolEval,
              textEval,
              rubricEval,
              latencyMs: Date.now() - started,
            });
          } catch (error) {
            taskResults.push({
              id: task.id,
              split: task.split,
              sourceFile: task.sourceFile,
              pass: false,
              expectedTool: task.expected?.tool || null,
              assistantText: "",
              toolCalls: [],
              toolEval: {
                applicable: true,
                pass: false,
                selectedTool: null,
                expectedToolCalled: false,
                requiredArgsPresent: false,
                argEqualsMatch: false,
                noToolMatch: null,
              },
              textEval: {
                applicable: Boolean(task.expectedText),
                pass: false,
                includesAllPass: false,
                includesAnyPass: false,
                excludesPass: false,
                regexPass: false,
              },
              rubricEval: {
                applicable: Boolean(task.rubric),
                pass: false,
                score: 0,
                reason: "Skipped because task execution failed.",
                skipped: false,
              },
              latencyMs: Date.now() - started,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        const metrics = computeMetrics(taskResults);
        const baselineRun = baselineMap.get(
          `${provider}|${promptFile}|${toolFile}`
        );
        const gates = evaluateThresholds(metrics, thresholds, baselineRun);

        const run = {
          provider,
          model:
            provider === "anthropic"
              ? args.modelAnthropic
              : provider === "openai"
                ? args.modelOpenAI
                : args.modelCerebras,
          promptFile,
          toolFile,
          ...metrics,
          thresholds: gates,
          baselineComparison: baselineRun
            ? {
                baselineSuccessRate: baselineRun.successRate,
                successRateDelta: Number(
                  (metrics.successRate - baselineRun.successRate).toFixed(2)
                ),
              }
            : null,
          taskResults,
        };

        runs.push(run);
        console.log(
          `[done] provider=${provider} prompt=${path.basename(promptFile)} tools=${path.basename(toolFile)} split=${args.split} success=${metrics.tasksPassed}/${metrics.tasksTotal} (${metrics.successRate}%) tool=${metrics.toolAccuracy}% text=${metrics.textAccuracy}% rubric=${metrics.rubricPassRate}% gates=${run.thresholds.pass ? "PASS" : "FAIL"}`
        );
      }
    }
  }

  if (args.requireRuns && runs.length === 0) {
    throw new Error(
      "No eval runs executed. Check provider flags and API keys, or disable --require-runs."
    );
  }

  const outputPath = ensureResultPath(args.out);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const payload = {
    runStartedAt,
    runFinishedAt: new Date().toISOString(),
    args,
    thresholds,
    runs,
  };
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log(`results: ${outputPath}`);

  if (args.failOnGateFail) {
    const failed = runs.filter((run) => !run.thresholds?.pass);
    if (failed.length > 0) {
      const msg = failed
        .map(
          (run) =>
            `${run.provider}:${path.basename(run.promptFile)}:${path.basename(run.toolFile)}`
        )
        .join(", ");
      throw new Error(`One or more eval runs failed thresholds: ${msg}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
