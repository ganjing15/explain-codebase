# explain-codebase

Generate a beautiful, interactive architecture doc for any codebase — with plain-English explanations, technical details, analogies, and a linked sidebar TOC.

## Usage

```
/explain-codebase [path] [--audience simple|technical|both]
```

- `path` — absolute or relative path to the project root (default: `/workspace/project`)
- `--audience` — depth level (default: `both`)
  - `simple` — analogies and plain English only, no file names or code
  - `technical` — full technical detail with file paths, function names, code snippets
  - `both` — side-by-side plain English + technical (recommended)

**Examples:**
```
/explain-codebase
/explain-codebase /workspace/project --audience simple
/explain-codebase /workspace/extra/myapp --audience technical
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
- What are the 3–7 major modules/components?
- What is the primary data flow? (input → ? → ? → output)

---

### Phase 2 — Trace the data flow

Follow the main path a piece of data takes through the system. For most projects this is:

1. **Inbound** — how does data enter? (HTTP request, webhook, file, message, event)
2. **Routing/dispatch** — how is it directed to the right handler?
3. **Processing** — what transforms it? (worker, agent, function, pipeline)
4. **Storage** — what persists? (database, file, cache)
5. **Outbound** — how does the result leave? (HTTP response, message, file write)

Read the key files for each stage. Use `grep` to find function definitions and key symbols.

**⚠️ STRICT VERIFICATION RULE — no guessing allowed:**

Every file name, function name, class name, interface name, and constant you write into the HTML **must be confirmed by actually reading the file or grepping for it first**. Do not infer or guess.

Before writing any `step-tech`, `step-tag`, or `tech-box` content, run the verification command:
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
- Don't assume which platform adapters exist — check `ls src/channels/`
- Don't assume a `skills/` directory exists at project root — check with `ls`
- Don't guess port numbers — grep for them in config files

For each stage, note:
- File name(s) and key function(s) — **verified by grep**
- What data looks like going IN and coming OUT
- Any interesting design decisions

---

### Phase 3 — Identify architecture patterns

Compare what you found to this pattern library. For each pattern present, use the provided plain-English explanation and analogy as a starting point (adapt to the specific project).

#### Pattern: Webhook receiver
- **What it is**: A URL that external services call to deliver events
- **Analogy**: A doorbell — instead of constantly checking if someone is there, you wait for the ring
- **Signs**: HTTP server on a specific port, event type routing, challenge/verification logic
- **Key info to extract**: port, event types handled, verification method

#### Pattern: Message queue / per-entity queue
- **What it is**: Messages wait in line so processing happens one at a time per entity
- **Analogy**: A single checkout lane per customer — no two clerks serving the same person at once
- **Signs**: Queue data structure, mutex/lock per entity, dequeue/enqueue functions
- **Key info to extract**: queue type, concurrency model, idle/timeout behavior

#### Pattern: Container / sandbox isolation
- **What it is**: Each task runs in a throwaway isolated environment
- **Analogy**: A disposable lunchbox — packed fresh, used once, thrown away. Nothing leaks out
- **Signs**: Docker/container API calls, mount configurations, --rm flag, credential injection
- **Key info to extract**: what's mounted, what's read-only, what's injected, lifecycle

#### Pattern: Credential proxy
- **What it is**: A local middleman that injects real secrets so workers never hold them
- **Analogy**: A hotel concierge — guests make requests requiring the master key, but never touch it
- **Signs**: Placeholder API keys, base URL redirection to localhost, token swap logic
- **Key info to extract**: port, what credentials are proxied, auth modes

#### Pattern: File-based IPC
- **What it is**: Two processes communicate by writing/reading files in a shared directory
- **Analogy**: A mail slot — drop a note in, someone on the other side reads and acts on it
- **Signs**: fs.watch / inotify, JSON files written to a watched directory, response files
- **Key info to extract**: watched directories, message types, response mechanism, security/namespacing

#### Pattern: Task scheduler / cron
- **What it is**: Tasks fire automatically at scheduled times, even without user input
- **Analogy**: A programmable alarm clock that can run anything, not just make noise
- **Signs**: Cron expression parsing, scheduled_tasks table, recurring vs one-shot, fire-and-spawn
- **Key info to extract**: storage mechanism, check interval, task types, persistence across restarts

#### Pattern: Channel abstraction
- **What it is**: A unified interface so the core system doesn't care which messaging platform is used
- **Analogy**: A universal power adapter — same device, different plugs for different countries
- **Signs**: Interface/protocol definition, multiple implementations (lark.ts, telegram.ts), registry
- **Key info to extract**: interface methods, which channels exist, how they're registered

#### Pattern: Router / dispatcher
- **What it is**: Directs incoming messages to the right handler based on rules
- **Analogy**: A post office sorting room — each letter goes to the right person based on the address
- **Signs**: Group/channel lookup tables, trigger pattern matching, allowlist checking
- **Key info to extract**: routing rules, trigger conditions, fallback behavior

#### Pattern: Agent / AI worker
- **What it is**: An AI model that can use tools and reason over multiple steps
- **Analogy**: A smart intern with a Swiss Army knife — you give it a task, it figures out the steps
- **Signs**: LLM SDK calls, tool definitions, system prompt loading, session/context management
- **Key info to extract**: model used, tools available, memory/context approach, output format

#### Pattern: Plugin / skill system
- **What it is**: Modular capabilities that can be added without changing the core system
- **Analogy**: App store for the AI — install a skill and new capabilities appear
- **Signs**: Skills directory, dynamic loading, markdown instruction files, tool injection
- **Key info to extract**: how skills are discovered, how they're injected, what they can do

---

### Phase 4 — Generate the HTML doc

Use the template below. Fill in every section. Rules:

#### Writing style — strict separation of layers

Every card has two layers. Keep them completely separate:

| Layer | Element | Voice | Example |
|-------|---------|-------|---------|
| Plain English | `step-title` + `step-desc` | Smart friend who's never coded. No jargon. | "Checks who sent the message and whether they're allowed to talk to Nano" |
| Technical | `step-tech` + `step-tag` | Developer reading the code. File names, function names, types. | `sender-allowlist.ts → isAllowedSender()` |

**The golden rule**: if a non-technical user reads only `step-title` + `step-desc`, they should fully understand what this step does. Technical users get the extra layer from `step-tech` + `step-tag`.

**Never put file names, function names, or code in `step-desc`.** Those belong in `step-tech` and `step-tag` only.

**Step title**: action phrase in plain English. "Message arrives", "Access check", "AI thinks", "Reply sent". Not "Channel listener invoked" or "Trigger pattern matched".

**Step desc**: 1–2 sentences. Use everyday analogies. Avoid: "the module", "the function", "the handler", "the payload", "instantiated", "dispatched", "invoked".

#### Concept explainers — analogy first, always

Each concept must open with the analogy block before any technical explanation. The analogy should make someone nod and say "oh, I get it" before they read a single technical word.

Good analogy: *"Like a doorbell — instead of constantly checking if someone's there, you wait for the ring."*
Bad analogy: *"Similar to a pub/sub event system where the webhook endpoint acts as the subscriber."*

#### Other rules

1. **Every step card must have**: a `step-tech` file/function name and a `step-desc` plain-English description
2. **Every concept must have**: an analogy block, plain-English explanation, bullet list, and (if relevant) a code example
3. **Linked titles**: if a step card references a concept (Docker, IPC, etc.), make the `step-title` a link to `#concept-{name}`
4. **Tags must not overflow**: use `word-break: break-all` on tag elements (already in template CSS)
5. **Sidebar TOC**: every `section-label` must have an `id` that matches a sidebar link
6. **Step section titles**: always use "Step N —" prefix. Use plain English after the dash — describe what happens, not the technical mechanism. "Step 2 — Queue & wait" not "Step 2 — GroupQueue concurrency control". For layered architectures, describe *what the layer does* not where it sits: "Step 3 — Data is stored" not "Step 3 — Database layer"

Write the HTML to: `/workspace/group/architecture-doc.html`

Then write the send-files manifest:
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
• {N} steps in the main data flow
• {N} architecture patterns identified: {list}
• {N} concept explainers with analogies

Open the HTML file in your browser — the sidebar lets you jump to any section.
```

---

## HTML Template

Copy this template exactly. Replace all `{PLACEHOLDER}` values.

**Structure notes:**
- Use `.section-h1` for the three top-level headings — no left bar, larger. Always use **"How It Works"** as the flow section name — it's universally clear for any project type and any audience, no decision needed
- Use `.section-label` for step sub-headings (Step 1 —, Step 2 —, …) — blue left bar, slightly smaller
- Sidebar group labels are `<a>` links that jump to their section — names must match the main headings exactly
- The brand logo is a link back to the top of the page
- Do NOT use `.step-tag.g/.y/.p/.r` color variants — all tags use the same blue style

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{PROJECT_NAME} Architecture</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #1e293b; min-height: 100vh;
    background: #f1f5f9;
  }
  .layout { display: flex; min-height: 100vh; }

  /* Sidebar — transparent, unified with main background */
  .sidebar {
    width: 240px; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto;
    background: transparent;
    border-right: 1px solid rgba(147,197,253,0.25);
    padding: 48px 0 40px;
  }
  .sidebar-brand { padding: 0 20px 24px; border-bottom: 1px solid rgba(147,197,253,0.25); margin-bottom: 16px; }
  .sidebar-brand .logo { font-size: 1.1rem; font-weight: 800; color: #2563eb; text-decoration: none; display: block; }
  .sidebar-brand .logo:hover { opacity: 0.8; }
  .sidebar-brand .tagline { font-size: 0.72rem; color: #94a3b8; margin-top: 2px; }
  .toc-group { margin-bottom: 6px; }
  /* Group labels are clickable links — names must match main headings exactly */
  .toc-group-label { display: block; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; padding: 8px 20px 4px; text-decoration: none; transition: color 0.15s; }
  a.toc-group-label:hover { color: #2563eb; }
  .toc-item { display: flex; align-items: center; gap: 8px; padding: 7px 20px; font-size: 0.82rem; color: #64748b; cursor: pointer; text-decoration: none; border-left: 3px solid transparent; transition: background 0.15s, color 0.15s, border-color 0.15s; line-height: 1.3; }
  .toc-item:hover { background: rgba(239,246,255,0.7); color: #1e293b; }
  .toc-item.active { background: rgba(219,234,254,0.6); color: #2563eb; border-left-color: #2563eb; font-weight: 600; }
  .toc-item .toc-num { width: 20px; height: 20px; border-radius: 50%; background: rgba(241,245,249,0.8); color: #64748b; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.15s, color 0.15s; }
  .toc-item.active .toc-num { background: #2563eb; color: #fff; }
  .toc-item .toc-icon { font-size: 0.9rem; flex-shrink: 0; }

  /* Main */
  .main { flex: 1; min-width: 0; padding: 48px 40px 80px 40px; }
  h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
  .subtitle { color: #64748b; font-size: 0.95rem; margin-bottom: 48px; }
  /* Top-level section headings — no left bar */
  .section-h1 { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin-bottom: 18px; margin-top: 48px; scroll-margin-top: 24px; }
  /* Step sub-headings — blue left bar */
  .section-label { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 14px; scroll-margin-top: 24px; border-left: 3px solid #2563eb; padding-left: 10px; }

  /* Flow cards — glassmorphic, single blue accent */
  .flow { display: flex; align-items: stretch; gap: 10px; margin-bottom: 32px; flex-wrap: wrap; }
  .flow-step { flex: 1; min-width: 155px; }
  .step-card {
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.9);
    border-top: 2px solid rgba(147,197,253,0.4);
    border-radius: 14px; padding: 16px 14px; height: 100%;
    box-shadow: 0 2px 16px rgba(37,99,235,0.06), 0 1px 3px rgba(0,0,0,0.04);
    transition: box-shadow 0.18s, transform 0.18s, border-top-color 0.18s, background 0.18s;
  }
  .step-card:hover {
    background: rgba(255,255,255,0.85);
    border-top-color: #2563eb;
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(37,99,235,0.13), 0 2px 8px rgba(0,0,0,0.06);
  }
  /* All color variants map to the same neutral blue — no rainbow */
  .step-card.blue, .step-card.yellow, .step-card.green,
  .step-card.purple, .step-card.orange, .step-card.teal, .step-card.rose { border-top: 2px solid rgba(147,197,253,0.4); }
  .step-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .step-emoji { font-size: 1.5rem; flex-shrink: 0; }
  .step-plain { display: none; }
  .step-title { font-size: 0.92rem; font-weight: 700; color: #0f172a; margin-bottom: 0; line-height: 1.3; }
  .step-title a { color: inherit; text-decoration: none; border-bottom: 1.5px dashed #93c5fd; }
  .step-title a:hover { color: #2563eb; border-bottom-color: #2563eb; }
  .step-tech  { font-size: 0.68rem; font-family: 'SF Mono','Fira Code',monospace; color: #94a3b8; margin-bottom: 7px; word-break: break-word; overflow-wrap: break-word; }
  .step-desc  { font-size: 0.78rem; color: #475569; line-height: 1.55; }
  /* All tags same blue style — do NOT use .g/.y/.p/.r color variants */
  .step-tag {
    display: inline-block; font-size: 0.63rem; font-family: monospace;
    background: rgba(219,234,254,0.5); color: #1d4ed8;
    border: 1px solid rgba(147,197,253,0.5);
    border-radius: 4px; padding: 1px 5px; margin-top: 5px; margin-right: 3px;
    word-break: break-all; white-space: normal; max-width: 100%;
  }
  .step-tag.g, .step-tag.y, .step-tag.p, .step-tag.r {
    background: rgba(219,234,254,0.5); color: #1d4ed8; border-color: rgba(147,197,253,0.5);
  }

  /* Container/sandbox section — blue tint */
  .container-section {
    background: rgba(239,246,255,0.55);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    border: 1.5px dashed rgba(147,197,253,0.6);
    border-radius: 16px; padding: 28px 20px 20px; margin-bottom: 32px; position: relative;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
  }
  .container-badge {
    position: absolute; top: -13px; left: 20px;
    background: rgba(255,255,255,0.9); backdrop-filter: blur(8px);
    border: 1px solid rgba(147,197,253,0.6);
    border-radius: 20px; padding: 3px 14px;
    font-size: 0.72rem; font-weight: 700; color: #2563eb; letter-spacing: 0.04em;
  }
  .container-inner { display: flex; gap: 12px; flex-wrap: wrap; }
  .container-inner .step-card { flex: 1; min-width: 145px; }

  /* Concepts — glassmorphic, collapsible */
  .concept {
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.9);
    box-shadow: 0 2px 16px rgba(37,99,235,0.05);
    border-radius: 14px; padding: 0; margin-bottom: 14px; overflow: hidden;
  }
  .concept-header { display: flex; align-items: center; gap: 12px; padding: 18px 20px; cursor: pointer; user-select: none; transition: background 0.15s; }
  .concept-header:hover { background: rgba(239,246,255,0.6); }
  .concept-icon { font-size: 1.4rem; flex-shrink: 0; }
  .concept-label { display: none; } /* hidden — section heading already provides context */
  .concept-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; }
  .concept-toggle { margin-left: auto; color: #94a3b8; font-size: 1rem; transition: transform 0.2s; flex-shrink: 0; }
  .concept-body { font-size: 0.82rem; color: #475569; line-height: 1.7; padding: 0 20px 20px; border-top: 1px solid rgba(226,232,240,0.6); }
  .concept-body p { margin-bottom: 10px; margin-top: 12px; }
  .concept-body strong { color: #1e293b; }
  .concept-body code { font-family: monospace; color: #2563eb; background: rgba(219,234,254,0.4); padding: 1px 5px; border-radius: 3px; font-size: 0.8rem; }
  .concept-body ul { padding-left: 18px; margin-bottom: 10px; }
  .concept-body li { margin-bottom: 5px; }
  .concept-body .analogy { background: rgba(239,246,255,0.7); border-left: 3px solid #93c5fd; border-radius: 0 8px 8px 0; padding: 10px 14px; margin: 14px 0; font-style: italic; color: #1d4ed8; }
  .concept-body .tech-box { background: rgba(248,250,252,0.8); border: 1px solid rgba(226,232,240,0.7); border-radius: 8px; padding: 12px 14px; margin: 10px 0; font-family: monospace; font-size: 0.76rem; color: #475569; overflow-x: auto; word-break: break-all; white-space: pre-wrap; }

  /* Reference grid — glassmorphic */
  .ref-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 40px; }
  .ref-card {
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.9);
    box-shadow: 0 2px 12px rgba(37,99,235,0.05);
    border-radius: 12px; padding: 16px 14px;
    transition: box-shadow 0.15s, transform 0.15s;
  }
  .ref-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(37,99,235,0.1); }
  .ref-title { font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .ref-file  { font-size: 0.7rem; font-family: monospace; color: #2563eb; margin-bottom: 8px; word-break: break-all; }
  .ref-desc  { font-size: 0.78rem; color: #64748b; line-height: 1.5; }

  hr { border: none; border-top: 1px solid rgba(226,232,240,0.5); margin: 40px 0; }
  .collapsible-body { overflow: hidden; transition: max-height 0.3s ease; }
  .collapsible-body.collapsed { max-height: 0; }
  .collapsible-body.expanded  { max-height: 3000px; }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .main { padding: 24px 16px 60px; }
    .ref-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<div class="layout">

  <aside class="sidebar">
    <div class="sidebar-brand">
      <!-- Logo links back to top of page -->
      <a class="logo" href="#">{PROJECT_EMOJI} {PROJECT_NAME}</a>
      <div class="tagline">Architecture Guide</div>
    </div>

    <div class="toc-group">
      <!-- Group label links to the matching section-h1 heading — name must match exactly -->
      <a class="toc-group-label" href="#flow-section">How It Works</a>
      <!-- One toc-item per step -->
      <a class="toc-item" href="#step1"><span class="toc-num">1</span> {STEP_1_TITLE}</a>
      <a class="toc-item" href="#step2"><span class="toc-num">2</span> {STEP_2_TITLE}</a>
      <!-- …repeat for each step… -->
    </div>

    <div class="toc-group">
      <a class="toc-group-label" href="#concepts-section">Key Concepts</a>
      <!-- One toc-item per concept -->
      <a class="toc-item" href="#concept-{name}"><span class="toc-icon">{EMOJI}</span> {CONCEPT_TITLE}</a>
      <!-- …repeat… -->
    </div>

    <div class="toc-group">
      <a class="toc-group-label" href="#reference">Key Files &amp; Directories</a>
    </div>
  </aside>

  <main class="main">
    <h1>{PROJECT_NAME} Architecture</h1>
    <p class="subtitle">{ONE_LINE_DESCRIPTION}</p>

    <!-- === MESSAGE FLOW === -->
    <div class="section-h1" id="flow-section">How It Works</div>

    <!-- Repeat for each step -->
    <div class="section-label" id="step1">Step 1 — {STEP_TITLE}</div>
    <div class="flow">
      <div class="flow-step"><div class="step-card">
        <div class="step-header">
          <span class="step-emoji">{EMOJI}</span>
          <div class="step-title">{TITLE_OR_LINKED_TITLE}</div>
        </div>
        <div class="step-tech">{src/file.ts → verifiedFunction()}</div>
        <div class="step-desc">{PLAIN_ENGLISH_DESCRIPTION — no jargon}</div>
        <span class="step-tag">{code-tag}</span>
      </div></div>
    </div>

    <!-- Use .container-section for isolated sandbox/worker steps -->
    <!--
    <div class="container-section">
      <div class="container-badge">🔒 {ISOLATION_LABEL}</div>
      <div class="container-inner">
        ...step-cards (same structure as above)...
      </div>
    </div>
    -->

    <hr>

    <!-- === KEY CONCEPTS === -->
    <div class="section-h1" id="concepts-section">Key Concepts</div>

    <!-- Repeat for each concept — first one expanded, rest collapsed -->
    <div id="concept-{name}" class="concept">
      <div class="concept-header" onclick="toggle(this)">
        <span class="concept-icon">{EMOJI}</span>
        <div>
          <div class="concept-label">Concept</div>
          <div class="concept-title">{CONCEPT_TITLE}</div>
        </div>
        <span class="concept-toggle">▾</span>
      </div>
      <div class="collapsible-body expanded"><div class="concept-body">
        <!-- Analogy FIRST, always — make the reader nod before any technical word -->
        <div class="analogy">{ANALOGY — everyday comparison, no jargon}</div>
        <p>{PLAIN_ENGLISH_EXPLANATION}</p>
        <ul>
          <li><strong>{POINT}</strong> — {EXPLANATION}</li>
        </ul>
        <div class="tech-box">{VERIFIED_CODE_EXAMPLE}</div>
      </div></div>
    </div>

    <hr>

    <!-- === KEY FILES & DIRECTORIES === -->
    <div class="section-h1" id="reference">Key Files &amp; Directories</div>
    <div class="ref-grid">
      <div class="ref-card">
        <div class="ref-title">{EMOJI} {TITLE}</div>
        <div class="ref-file">{verified/file/path.ts}</div>
        <div class="ref-desc">{DESCRIPTION}</div>
      </div>
      <!-- …repeat… -->
    </div>

  </main>
</div>

<script>
function toggle(header) {
  const body = header.parentElement.querySelector('.collapsible-body');
  const arrow = header.querySelector('.concept-toggle');
  if (body.classList.contains('expanded')) {
    body.classList.replace('expanded','collapsed');
    arrow.style.transform = 'rotate(-90deg)';
  } else {
    body.classList.replace('collapsed','expanded');
    arrow.style.transform = '';
  }
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const body = el.querySelector('.collapsible-body');
  if (body && body.classList.contains('collapsed')) {
    body.classList.replace('collapsed','expanded');
    const arrow = el.querySelector('.concept-toggle');
    if (arrow) arrow.style.transform = '';
  }
  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

const sectionIds = Array.from(document.querySelectorAll('[id]'))
  .filter(el => el.classList.contains('section-label') || el.classList.contains('section-h1') || el.classList.contains('concept'))
  .map(el => el.id).filter(Boolean);

function updateToc() {
  let current = sectionIds[0];
  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 60) current = id;
  }
  document.querySelectorAll('.toc-item').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', updateToc, { passive: true });
updateToc();

document.querySelectorAll('.toc-item, a.toc-group-label, .sidebar-brand .logo').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    e.preventDefault(); scrollToId(href.slice(1));
  });
});
document.querySelectorAll('.step-title a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); scrollToId(a.getAttribute('href').slice(1)); });
});
</script>
</body>
</html>
```

---

## Quality checklist

Before writing the send-files manifest, verify:

- [ ] Every step has a `step-tech` (file/function) and `step-desc` (plain English)
- [ ] Every concept has an analogy block
- [ ] All concept IDs match sidebar href values
- [ ] No text overflows its card (long strings have `word-break: break-all`)
- [ ] Sidebar TOC has entries for every `id`ed section
- [ ] Step titles that reference concepts are linked (`<a href="#concept-x">`)
- [ ] The HTML opens correctly in a browser (well-formed, no unclosed tags)

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

For **every** platform/adapter claimed to exist (e.g. WhatsApp, Slack):
```bash
ls {path}/src/channels/
```

**If any check fails → remove or correct the claim before sending.**
