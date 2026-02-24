# Cookbook Agent Eval Harness

This folder contains a practical, repo-local evaluation harness for the cookbook app agent.

Goal: compare **system prompt variants** and **tool specification variants** across providers, then gate changes with objective metrics before production rollout.

## What We Built

### Phase 1 (already implemented)
- Matrix runner for:
  - Provider: Anthropic / OpenAI / Cerebras
  - Prompt variants: `eval/prompts/*.txt`
  - Tool variants: `eval/tools/*.json`
- Deterministic code grading focused on tool routing:
  - Correct tool selected
  - Required arguments present
  - Exact argument extraction for known fields (for example `recipeId`)

### Phase 2 (implemented now)
- Added split-based datasets:
  - `train` for fast iteration
  - `dev` for edge-case tuning
  - `heldout` for go/no-go
- Added response quality grading:
  - Code-based text checks (`includesAll`, `includesAny`, `excludes`, `regex`)
  - Rubric-based model grading (`rubric`)
- Added gating thresholds:
  - Success rate
  - Tool accuracy
  - Text accuracy
  - Rubric pass rate
  - P95 latency
  - Optional regression vs baseline artifact

## Key Files

- Runner:
  - `eval/run.mjs`
- Graders:
  - `eval/graders/index.mjs`
  - `eval/graders/rubric-anthropic.prompt.txt`
  - `eval/graders/rubric-response.schema.json`
- Prompt variants:
  - `eval/prompts/cookbook-v1.txt`
  - `eval/prompts/cookbook-v2-concise.txt`
- Tool variants:
  - `eval/tools/recipe-tools-v1.json`
  - `eval/tools/recipe-tools-v2-concise.json`
- Task suites:
  - `eval/tasks/train.json`
  - `eval/tasks/dev.json`
  - `eval/tasks/heldout.json`
- Default gate thresholds:
  - `eval/thresholds/default.json`
- Results:
  - `eval/results/*.json`

## Task Schema

Each task supports these fields:

- `id`: unique task id
- `split`: optional (`train`/`dev`/`heldout`) if not inherited from file
- `clientPath`: optional current path context
- `message`: user input under test
- `expected`: tool expectation
- `expectedText`: code-based response assertions
- `rubric`: LLM grader rubric text

### `expected` options

1. Exact tool expectation:
```json
{
  "tool": "recipes_get_recipe",
  "requiredArgs": ["recipeId"],
  "argEquals": { "recipeId": "..." }
}
```

2. No-tool expectation:
```json
{ "noTool": true }
```

3. Multi-path acceptable behavior:
```json
{
  "anyOf": [
    { "tool": "recipes_update_recipe", "requiredArgs": ["recipeId"] },
    { "tool": "recipes_get_recipe", "requiredArgs": ["recipeId"] }
  ]
}
```

### `expectedText` options
```json
{
  "includesAll": ["must appear"],
  "includesAny": ["one of these", "or this"],
  "excludes": ["must not appear"],
  "regex": ["optional-pattern"]
}
```

### `rubric`
- Free-text rubric used by model grader.
- Use for behavior quality that is hard to code-grade.

## How Scoring Works

Per task:
- `toolEval.pass`
- `textEval.pass`
- `rubricEval.pass` (only if rubric grading enabled and applicable)

Overall task pass:
- `toolEval.pass && textEval.pass && rubric condition`
- Rubric condition is ignored when rubric is not applicable or skipped.

Per run summary:
- `successRate`
- `toolAccuracy`
- `textAccuracy`
- `rubricPassRate`
- `rubricAvgScore`
- `p95LatencyMs`
- threshold checks + overall gate PASS/FAIL

## Threshold Gates

Configured in `eval/thresholds/default.json`.

Current defaults:
- `minSuccessRate`: 70
- `minToolAccuracy`: 85
- `minTextAccuracy`: 65
- `minRubricPassRate`: 65
- `maxP95LatencyMs`: 40000
- `maxRegressionPct`: 3

Notes:
- `minTextAccuracy` gate applies only when text-graded tasks exist.
- `minRubricPassRate` gate applies only when rubric-graded tasks exist.

## Running

### Prerequisites

Set provider keys for providers you want to run:
```bash
export ANTHROPIC_API_KEY=...
export OPENAI_API_KEY=...
export CEREBRAS_API_KEY=...
```

### Common commands

Run full matrix:
```bash
pnpm eval:harness
```

Run one provider + split:
```bash
pnpm eval:harness -- --provider openai --split dev
```

CI-equivalent heldout gate:
```bash
pnpm eval:ci-heldout
```

Disable rubric grading (faster):
```bash
pnpm eval:harness -- --grader none
```

Heldout go/no-go:
```bash
pnpm eval:harness -- --provider openai --split heldout --grader anthropic
```

Compare against a baseline artifact:
```bash
pnpm eval:harness -- \
  --provider openai \
  --split heldout \
  --baseline eval/results/previous-run.json
```

## What We Learned So Far

1. Deterministic routing tasks are generally strong.
2. Edge-case and rubric tasks exposed real behavior issues (for example out-of-scope financial advice responses).
3. Eval definition quality matters:
   - overly brittle text checks created false negatives early
   - ambiguous prompts (for example “stock”) created misleading failures
4. Rubric grading introduces latency overhead and should be used intentionally (dev/heldout, not every quick run).

## Known Limitations

1. This harness currently validates **selection and response behavior**, not full DB mutation correctness end-to-end.
2. Rubric grader is currently Anthropic-only.
3. No confidence intervals/statistical significance yet.
4. CI currently runs a heldout gate on PRs for OpenAI + Anthropic grader; it does not yet run a full multi-provider matrix.

## Recommended Next Steps

1. Add production prompt hardening for out-of-scope requests.
2. Add an end-to-end suite with seeded Supabase eval user/data:
   - verify actual tool execution outcomes
   - assert post-conditions in database
3. Add CI policy:
   - required heldout gate for prompt/tool PRs
   - optional nightly full matrix
4. Increase heldout breadth:
   - longer/noisier prompts
   - adversarial or conflicting instructions
   - context mismatch cases
5. Add cost/token reporting per run for budget-aware optimization.

## Practical Workflow

1. Iterate on `train` quickly (grader optional).
2. Validate changes on `dev` (grader on).
3. Use `heldout` as release gate.
4. Save a `baseline` artifact from the current production config.
5. Reject candidate changes that regress beyond threshold.

## CI Automation

GitHub Actions workflow:
- `.github/workflows/eval-heldout.yml`

Behavior:
1. Triggers on PRs touching agent/eval files and on manual dispatch.
2. Runs heldout gate with:
   - provider: OpenAI
   - grader: Anthropic
   - `--require-runs true`
   - `--fail-on-gate-fail true`
3. Uploads JSON artifact from `eval/results/`.
4. Writes a metric summary to workflow step summary.

Required secrets for CI:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

## PR Checklist

Use this checklist for any PR that changes:
- system prompts
- tool descriptions/schemas
- tool-routing logic
- model/provider defaults affecting agent behavior

### 1) Run evals

Fast sanity:
```bash
pnpm eval:harness -- --provider openai --split train --grader none --out eval/results/pr-train.json
```

Behavior tuning:
```bash
pnpm eval:harness -- --provider openai --split dev --grader anthropic --out eval/results/pr-dev.json
```

Release gate:
```bash
pnpm eval:harness -- --provider openai --split heldout --grader anthropic --out eval/results/pr-heldout.json
```

Optional regression check against baseline:
```bash
pnpm eval:harness -- \
  --provider openai \
  --split heldout \
  --grader anthropic \
  --baseline eval/results/<baseline>.json \
  --out eval/results/pr-heldout-vs-baseline.json
```

### 2) Attach artifacts in PR description

- `eval/results/pr-train.json`
- `eval/results/pr-dev.json`
- `eval/results/pr-heldout.json`
- baseline comparison artifact (if used)

### 3) Report summary in PR description

- Provider + model
- Prompt variant and tool variant tested
- `successRate`
- `toolAccuracy`
- `textAccuracy`
- `rubricPassRate`
- `p95LatencyMs`
- Threshold gate result: `PASS` / `FAIL`
- Any failed tasks by id and planned follow-up

### 4) Merge criteria

- Heldout gate is `PASS`
- No regression beyond threshold vs baseline (when baseline comparison is included)
- Any known failures are explicitly accepted by reviewer with rationale
