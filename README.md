# explain-codebase

A skill that generates a **beautiful, interactive HTML architecture doc** for any codebase — with plain-English explanations, analogies, verified technical details, and a linked sidebar table of contents.

👉 **[See live example →](https://ganjing15.github.io/explain-codebase/nanoclaw-architecture.html)**

---

## What it produces

A single self-contained HTML file with:

- **How It Works** — step-by-step flow of how data/requests move through the system, with emoji cards, plain-English descriptions, and verified file/function references
- **Key Concepts** — collapsible explainers for architecture patterns (webhooks, queues, containers, etc.), each opening with an everyday analogy before any technical detail
- **Key Files & Directories** — a reference grid of the most important files with descriptions
- **Sidebar TOC** — sticky left nav that highlights your position as you scroll, all headings clickable

Designed to be understood by both **non-technical stakeholders** and **developers** — plain English on top, technical detail underneath.

---

## Usage

### With Claude Code

In any Claude Code session, simply ask:

```
Read SKILL.md from https://raw.githubusercontent.com/ganjing15/explain-codebase/main/SKILL.md
and follow it to generate an architecture doc for this codebase.
```

Or paste `SKILL.md` directly into your session and say:

```
Follow the explain-codebase skill to generate an architecture doc for /path/to/project
```

### With any AI coding tool

Any AI tool that can read files and run bash commands (Cursor, Windsurf, Aider, etc.) can use this skill. Paste the contents of `SKILL.md` into the system prompt or as a user message, then point it at a codebase.

### With NanoClaw

Install the skill into your NanoClaw project:

```bash
# From the NanoClaw project root on your host machine
node groups/main/explain-codebase-skill/install.js
```

Then trigger it in chat:

```
/explain-codebase
/explain-codebase /workspace/extra/myapp
```

---

## How it works

The skill walks the AI through 5 phases:

1. **Explore** — map the directory structure, read the entry point, identify major modules
2. **Trace** — follow a piece of data from input to output through the system
3. **Patterns** — match what's found against a library of 10 common architecture patterns (webhook receiver, message queue, container sandbox, credential proxy, file-based IPC, task scheduler, channel abstraction, router/dispatcher, AI worker, plugin system)
4. **Generate** — produce the HTML doc using a fixed template with strict writing style rules
5. **Summary** — send a brief text summary of what was found

### Writing style rules

The skill enforces a strict two-layer separation:

| Layer | Where | Voice | Example |
|-------|-------|-------|---------|
| Plain English | `step-title` + `step-desc` | Smart friend who's never coded | "Checks who sent the message and whether they're allowed in" |
| Technical | `step-tech` + `step-tag` | Developer reading the code | `sender-allowlist.ts → isSenderAllowed()` |

### Hallucination prevention

Every file name, function name, and constant in the output **must be verified with grep before inclusion**. The skill includes an explicit accuracy checklist the AI runs before finalising the doc.

---

## Design

- Light gray background (`#f1f5f9`), glassmorphic cards with backdrop blur
- Single blue accent (`#2563eb`) — no rainbow colors
- Two heading levels: top-level (no bar) and step sub-headings (blue left bar)
- Responsive: sidebar hidden on mobile
- Zero dependencies — pure HTML/CSS/JS, open in any browser

---

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | The skill prompt — works with Claude Code and any AI coding tool |
| `install.js` | NanoClaw installer — copies skill into the project |

---

## License

MIT
