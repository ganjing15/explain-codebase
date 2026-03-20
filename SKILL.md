---
name: explain-codebase
description: Generate interactive HTML architecture documentation for any codebase — with plain-English explanations, analogies, verified technical details, data flow diagrams, and a linked sidebar TOC. Use when asked to explain, document, or map out how a codebase works, or when onboarding someone to a project.
---

# explain-codebase

Generate a beautiful, interactive architecture doc for any codebase — with plain-English explanations, technical details, analogies, and a linked sidebar TOC.

## Usage

```
/explain-codebase [path] [--audience simple|technical|both] [--lang LANG] [--output filename.html]
```

- `path` — absolute or relative path to the project root (default: current working directory, or `/workspace/project` if inside a NanoClaw container)
- `--audience` — depth level (default: `both`)
  - `simple` — analogies and plain English only, no file names or code
  - `technical` — full technical detail with file paths, function names, code snippets
  - `both` — side-by-side plain English + technical (recommended)
- `--lang` — add a second language toggle (e.g. `--lang zh` for Chinese, `--lang fr` for French). If omitted, page is English-only with no toggle.
- `--output` — output file path (default: `architecture-doc.html` in the project root)

**Examples:**
```
/explain-codebase
/explain-codebase ./src --audience simple
/explain-codebase /path/to/myapp --audience technical --output myapp-arch.html
/explain-codebase --lang zh
```

---

## How it works

You will go through 5 phases. Think carefully at each phase before moving on.

---

### Phase 1 — Explore (map the territory)

Run these in parallel to get a quick structural overview:

```bash
# Directory tree (2 levels)
find {path} -maxdepth 2 -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/__pycache__/*' | head -80

# Package info
cat {path}/package.json 2>/dev/null || cat {path}/pyproject.toml 2>/dev/null || cat {path}/Cargo.toml 2>/dev/null | head -30

# Entry point candidates
ls {path}/src/ 2>/dev/null || ls {path}/app/ 2>/dev/null || ls {path}/lib/ 2>/dev/null

# Config files
ls {path}/*.env* {path}/.env* {path}/config* 2>/dev/null | head -10
```

Then read the **main entry point** (usually `src/index.ts`, `main.py`, `app.js`, `main.go`, etc.) fully.

Build a mental map:
- What does this project *do* in one sentence?
- What are the 3-7 major modules/components?
- What is the primary data flow? (input -> ? -> ? -> output)

If the project is empty, has no recognizable structure, or has no entry point, tell the user and stop — don't generate a doc for an empty project.

---

### Phase 2 — Trace the data flow

Follow the main path a piece of data takes through the system. For most projects this is:

1. **Inbound** — how does data enter? (HTTP request, webhook, file, message, event)
2. **Routing/dispatch** — how is it directed to the right handler?
3. **Processing** — what transforms it? (worker, agent, function, pipeline)
4. **Storage** — what persists? (database, file, cache)
5. **Outbound** — how does the result leave? (HTTP response, message, file write)

Read the key files for each stage. Use `grep` to find function definitions and key symbols.

**STRICT VERIFICATION RULE — no guessing allowed:**

Every file name, function name, class name, interface name, and constant you write into the HTML **must be confirmed by actually reading the file or grepping for it first**. Do not infer or guess.

Before writing any `step-tech` or `tech-box` content, run the verification command:
```bash
# Verify a function exists before citing it:
grep -n "functionName" {path}/src/file.ts

# Verify a file exists before citing it:
ls {path}/src/

# Verify a constant or config value:
grep -n "CONSTANT_NAME" {path}/src/config.ts
```

If you cannot find something with grep, **do not include it**. Write the file name only (e.g. `src/index.ts`) without a fake function name rather than guessing.

Common hallucination traps to avoid:
- Don't assume function names from their purpose (e.g. `handleWebhook`, `saveMessage`, `enqueue` may not exist)
- Don't assume file names from their role (e.g. `agent-runner.ts`, `scheduler.ts`, `store/messages.ts` may not exist)
- Don't assume which adapters/plugins exist — check with `ls`
- Don't guess port numbers — grep for them in config files

For each stage, note:
- File name(s) and key function(s) — **verified by grep**
- What data looks like going IN and coming OUT
- Any interesting design decisions

---

### Phase 3 — Identify architecture patterns

Read `references/patterns.md` in this skill's directory for a library of common architecture patterns with analogies, detection signals, and what to extract. Use these as a starting point, but also identify any patterns not in the list — write your own analogy and explanation following the same format.

Identify every significant pattern in the codebase — not just the ones in the reference library. If you find patterns like actor model, CQRS, event sourcing, GraphQL layer, rate limiter, circuit breaker, API gateway, worker pool, etc., write your own analogy and explanation.

For each pattern you find — whether from the library or not — include:
- A plain-English name (not the technical term if it confuses non-coders)
- An everyday analogy that makes someone nod before reading any technical detail
- What signs pointed to this pattern in the codebase
- Key files/functions involved (verified)

---

### Phase 4 — Generate the HTML doc

Read the HTML template from `references/template.html` in this skill's directory. Copy it exactly, then fill in all `{PLACEHOLDER}` values.

#### Audience-specific generation

Based on the `--audience` flag:

- **`--audience simple`**: Remove all `step-tech` elements. Keep only `step-title`, `step-desc`, and analogy blocks. Hide the "Key Files" section entirely. Write step descriptions in everyday language only.
- **`--audience technical`**: Remove all analogy blocks from concepts. Keep `step-tech` and code examples. Write `step-desc` in technical language (function names, types OK).
- **`--audience both`** (default): Include everything — both layers side by side.

#### Writing style — strict separation of layers

Every card has two layers. Keep them completely separate:

| Layer | Element | Voice | Example |
|-------|---------|-------|---------|
| Plain English | `step-title` + `step-desc` | Smart friend who's never coded. No jargon. | "Checks who sent the message and whether they're allowed to talk" |
| Technical | `step-tech` | Developer reading the code. File names, function names, types. | `sender-allowlist.ts -> isAllowedSender()` |

**The golden rule**: if a non-technical user reads only `step-title` + `step-desc`, they should fully understand what this step does. Technical users get the extra layer from `step-tech`.

**Never put file names, function names, or code in `step-desc`.** Those belong in `step-tech` only.

**Step title**: action phrase in plain English. "Message arrives", "Access check", "AI thinks", "Reply sent". Not "Channel listener invoked" or "Trigger pattern matched".

**Step desc**: 1-2 sentences. Use everyday analogies. Avoid: "the module", "the function", "the handler", "the payload", "instantiated", "dispatched", "invoked".

#### Concept explainers — analogy first, always

Each concept must open with the analogy block before any technical explanation. The analogy should make someone nod and say "oh, I get it" before they read a single technical word.

Good analogy: *"Like a doorbell — instead of constantly checking if someone's there, you wait for the ring."*
Bad analogy: *"Similar to a pub/sub event system where the webhook endpoint acts as the subscriber."*

#### Language toggle (only when `--lang` was specified)

If `--lang LANG` was provided (e.g. `--lang zh`):

1. **Uncomment the lang toggle button** in the sidebar brand area (remove the comment wrapper)
2. **Generate a `T` object** in the `<script>` block with two keys: `en` and the specified language code. Every user-visible string in the page must have an entry in both objects — this includes: page title, h1, subtitle, tagline, TOC labels, section headings, all step card titles/descriptions, all concept titles/bodies/analogies, all reference card titles/descriptions, and all SVG `<text>` content.
3. **Add `id` attributes** to every DOM element that needs language switching (step titles, step descs, concept titles, ref titles, etc.) — or target them via structural selectors in `applyLang()`.
4. **Replace `{LANG}` and `{LANG_ABBR}` placeholders** in the JS with the actual language code and abbreviation (e.g. `'zh'` and `'ZH'`).
5. **Thumb labels**: EN side shows `EN`; the other side shows the secondary lang abbreviation.
6. **Translation quality**: Write natural translations, not word-for-word. For plain-English `step-desc` and analogies, translate the meaning — not the English idiom. Technical terms in `step-tech` stay in English (they're code, not prose).

If no `--lang` flag was given, leave the lang toggle comment block as-is (it will be invisible) and omit the `T` object and `applyLang`/`toggleLang` functions from the JS.

#### Architecture overview diagram (goes in the Overview section)

Replace the `{SVG_DIAGRAM}` placeholder with an inline SVG that shows the system's structure at a glance. The diagram should:

- **Show 3–5 horizontal layers** (rows) reflecting how data moves through the system. Adapt the layers to the actual codebase — don't force the NanoClaw structure onto a different app. Typical layer names for reference: Inputs, Core/Routing, Processing/Queue, Execution, Storage/Output.
- **Each layer** has: a layer label (small caps, gray, left-aligned), and one or more rounded-rect boxes showing the components at that layer.
- **Arrows** connect layers top-to-bottom showing the primary data flow.
- **SVG dimensions**: `viewBox="0 0 900 {HEIGHT}"` — adjust height to fit actual layers. Width stays 900.
- **Every `<text>` element that contains a user-visible label must have a unique `id`** (e.g. `id="svg-lbl-inputs"`, `id="svg-router-title"`) so it can be targeted if the page is extended with translations.
- **Colors**: boxes use `fill="#eff6ff" stroke="#93c5fd"` (light blue). Layer labels `fill="#94a3b8"`. Arrows `stroke="#2563eb"`. Background transparent (no `<rect>` background fill).

#### Other rules

1. **Every step card must have**: a `step-tech` file/function name and a `step-desc` plain-English description. Do NOT add `step-tag` chips — they repeat what `step-tech` already says.
2. **Every concept must have**: an analogy block, a plain-English `<p>`, and a `tech-box` with the actual API surface. The `<ul>` bullet list is optional — only include bullets for genuinely non-obvious design decisions (the "why" or surprising behaviour). Remove bullets that restate what the `<p>` already explains or just list method names covered by the `tech-box`.
3. **Linked titles**: if a step card references a concept (Docker, IPC, etc.), make the `step-title` a link to `#concept-{name}`
4. **Tags must not overflow**: use `word-break: break-all` on tag elements (already in template CSS)
5. **Sidebar TOC**: every `section-label` must have an `id` that matches a sidebar link
6. **Step section titles**: always use "Step N —" prefix. Use plain English after the dash — describe what happens, not the technical mechanism. "Step 2 — Queue & wait" not "Step 2 — GroupQueue concurrency control"
7. **TOC/heading consistency**: every `toc-group-label` text must match its target `section-h1` heading text exactly — same string, no variations.

#### Output location

Write the HTML to `{output}` (default: `architecture-doc.html` in the project root).

If running inside a NanoClaw container (check if `/workspace/ipc/` exists), also write the send-files manifest:
```json
[{"type": "file", "path": "architecture-doc.html", "name": "{ProjectName} Architecture.html"}]
```
to `/workspace/group/.send_files.json`

---

### Phase 5 — Summary message

After writing the files, send a brief text summary:

```
Here's the architecture doc for {ProjectName}!

It covers:
- {N} steps in the main data flow
- {N} architecture patterns identified: {list}
- {N} concept explainers with analogies
- Interactive data flow diagram

Open the HTML file in your browser — the sidebar lets you jump to any section. Toggle dark mode with the button in the sidebar.
```

---

## Quality checklist

Before finishing, verify:

- [ ] Every step has a `step-tech` (file/function) and `step-desc` (plain English)
- [ ] Every concept has an analogy block
- [ ] All concept IDs match sidebar href values
- [ ] No text overflows its card (long strings have `word-break: break-all`)
- [ ] Sidebar TOC has entries for every `id`ed section
- [ ] Step titles that reference concepts are linked (`<a href="#concept-x">`)
- [ ] The HTML opens correctly in a browser (well-formed, no unclosed tags)
- [ ] Every `toc-group-label` text matches its `section-h1` heading text exactly (same string)
- [ ] The Overview SVG diagram is present and all `<text>` elements have `id` attributes
- [ ] Theme toggle button is present in sidebar brand area

### Accuracy checklist (run these greps before finalising)

For **every** file path mentioned in the HTML:
```bash
ls {path}/src/ | grep "filename"   # confirm it exists
```

For **every** function/class/interface name mentioned:
```bash
grep -n "functionName\|ClassName" {path}/src/file.ts   # confirm it's real
```

For **every** port number, env var, or config value:
```bash
grep -n "PORT\|URL\|KEY" {path}/src/config.ts
```

For **every** platform/adapter claimed to exist:
```bash
ls {path}/src/channels/ 2>/dev/null || ls {path}/src/adapters/ 2>/dev/null
```

**If any check fails, remove or correct the claim before sending.**
