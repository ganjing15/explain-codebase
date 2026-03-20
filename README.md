# explain-codebase

A skill that generates a **beautiful, interactive HTML architecture doc** for any codebase — with plain-English explanations, analogies, verified technical details, and a linked sidebar table of contents.

👉 **[See live example →](https://ganjing15.github.io/explain-codebase/nanoclaw-architecture.html)**

---

## Install

### Claude Code — project (one project only)

```bash
mkdir -p .claude/commands && curl -sL https://raw.githubusercontent.com/ganjing15/explain-codebase/main/SKILL.md -o .claude/commands/explain-codebase.md
```

### Claude Code — global (all projects)

```bash
mkdir -p ~/.claude/commands && curl -sL https://raw.githubusercontent.com/ganjing15/explain-codebase/main/SKILL.md -o ~/.claude/commands/explain-codebase.md
```

Then in any Claude Code session:

```
/explain-codebase
```

---

## Usage

### Claude Code (after install)

```
/explain-codebase
/explain-codebase /path/to/project
```

### Claude Code (without installing)

Paste this into your session:

```
Fetch https://raw.githubusercontent.com/ganjing15/explain-codebase/main/SKILL.md
and follow the instructions to generate an architecture doc for this codebase.
```

### Any other AI coding tool

Any tool that can read files and run bash commands (Cursor, Windsurf, Aider, etc.) — paste `SKILL.md` into the system prompt or as a user message, then point it at a codebase.

### NanoClaw

```bash
# From the NanoClaw project root on your host machine
node groups/main/explain-codebase-skill/install.js
```

Then use `/explain-codebase` in chat.

---

## What it produces

A single self-contained HTML file with:

- **How It Works** — step-by-step flow of how data/requests move through the system, with emoji cards, plain-English descriptions, and verified file/function references
- **Key Concepts** — collapsible explainers for architecture patterns, each opening with an everyday analogy before any technical detail
- **Key Files & Directories** — a reference grid of the most important files with descriptions
- **Sidebar TOC** — sticky left nav that highlights your position as you scroll, all headings clickable

Designed to be understood by both **non-technical stakeholders** and **developers** — plain English on top, technical detail underneath.

---

## How it works

The skill walks the AI through 5 phases:

1. **Explore** — map the directory structure, read the entry point, identify major modules
2. **Trace** — follow a piece of data from input to output through the system
3. **Patterns** — identify every architecture pattern found, whether common (webhook, queue, container, pub/sub, CQRS, actor model…) or project-specific. The skill includes a reference library of patterns with ready-made analogies, but is not limited to it
4. **Generate** — produce the HTML using a fixed template with strict writing style rules
5. **Summary** — send a brief text summary of what was found

### Writing style rules

Strict two-layer separation:

| Layer | Where | Voice | Example |
|-------|-------|-------|---------|
| Plain English | `step-title` + `step-desc` | Smart friend who's never coded | "Checks who sent the message and whether they're allowed in" |
| Technical | `step-tech` + `step-tag` | Developer reading the code | `sender-allowlist.ts → isSenderAllowed()` |

### Hallucination prevention

Every file name, function name, and constant **must be verified with grep before inclusion**. The skill includes an explicit accuracy checklist the AI runs before finalising.

---

## Design

- Light gray background, glassmorphic cards with backdrop blur
- Single blue accent — no rainbow colors
- Two heading levels: top-level (no bar) and step sub-headings (blue left bar)
- Responsive: sidebar hidden on mobile
- Zero dependencies — pure HTML/CSS/JS, open in any browser

---

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | The skill prompt — works with Claude Code and any AI coding tool |
| `install.js` | NanoClaw installer |

---

## License

MIT
