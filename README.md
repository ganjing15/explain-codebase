# explain-codebase

A skill that generates a **beautiful, interactive HTML architecture doc** for any codebase — with plain-English explanations, analogies, verified technical details, an SVG overview diagram, dark mode, and a linked sidebar TOC.

👉 **[See live example →](https://ganjing15.github.io/explain-codebase/nanoclaw-architecture.html)**

---

## Install

### Claude Code — global (all projects)

```bash
mkdir -p ~/.claude/commands/references
curl -sL https://raw.githubusercontent.com/ganjing15/explain-codebase/main/SKILL.md \
  -o ~/.claude/commands/explain-codebase.md
curl -sL https://raw.githubusercontent.com/ganjing15/explain-codebase/main/references/template.html \
  -o ~/.claude/commands/references/template.html
curl -sL https://raw.githubusercontent.com/ganjing15/explain-codebase/main/references/patterns.md \
  -o ~/.claude/commands/references/patterns.md
```

### Claude Code — project only

```bash
mkdir -p .claude/commands/references
curl -sL https://raw.githubusercontent.com/ganjing15/explain-codebase/main/SKILL.md \
  -o .claude/commands/explain-codebase.md
curl -sL https://raw.githubusercontent.com/ganjing15/explain-codebase/main/references/template.html \
  -o .claude/commands/references/template.html
curl -sL https://raw.githubusercontent.com/ganjing15/explain-codebase/main/references/patterns.md \
  -o .claude/commands/references/patterns.md
```

Then in any Claude Code session:

```
/explain-codebase
```

### NanoClaw

```bash
# From the NanoClaw project root
node groups/main/explain-codebase-skill/install.js
```

Then use `/explain-codebase` in chat.

### Any other AI coding tool

Paste `SKILL.md` into the system prompt or as a user message, along with the contents of `references/template.html` and `references/patterns.md`, then point it at a codebase.

---

## Usage

```
/explain-codebase [path] [--audience simple|technical|both] [--lang LANG] [--output filename.html]
```

- `path` — path to the project root (default: current directory)
- `--audience` — `simple` (plain English only) · `technical` (full detail) · `both` (default)
- `--lang` — add a second-language toggle, e.g. `--lang zh` for Chinese, `--lang fr` for French
- `--output` — custom output filename (default: `architecture-doc.html`)

**Examples:**
```
/explain-codebase
/explain-codebase /path/to/myapp --audience simple
/explain-codebase --lang zh
/explain-codebase --audience technical --output myapp-arch.html
```

---

## What it produces

A single self-contained HTML file with:

- **Architecture overview** — inline SVG diagram showing layers and data flow at a glance
- **How It Works** — step-by-step flow cards with plain-English descriptions and verified file/function references
- **Key Concepts** — collapsible explainers for architecture patterns, each opening with an everyday analogy
- **Key Files** — reference grid of the most important files and directories
- **Sidebar TOC** — sticky nav that highlights your position as you scroll
- **Dark mode** — pill toggle in the sidebar, persists across sessions, respects system preference
- **Language toggle** — optional second-language pill (when `--lang` is specified)

Designed to be understood by both **non-technical stakeholders** and **developers** — plain English first, technical detail underneath.

---

## How it works

The skill walks the AI through 5 phases:

1. **Explore** — map the directory structure, read the entry point, identify major modules
2. **Trace** — follow a piece of data from input to output, verifying every file and function name with grep before writing it
3. **Patterns** — identify every architecture pattern in the codebase using the bundled pattern library (16 patterns with analogies) or writing new ones
4. **Generate** — produce the HTML from `references/template.html` with strict writing style rules
5. **Summary** — send a brief text summary of what was found

### Writing style — two-layer separation

| Layer | Element | Voice | Example |
|-------|---------|-------|---------|
| Plain English | `step-title` + `step-desc` | Smart friend who's never coded | "Checks who sent the message and whether they're allowed in" |
| Technical | `step-tech` | Developer reading the code | `sender-allowlist.ts → isSenderAllowed()` |

### Hallucination prevention

Every file name, function name, and constant **must be verified with grep before inclusion**. The skill includes an explicit accuracy checklist the AI runs before finalising.

---

## Design

- Light blue palette — single accent color, no rainbow
- Glassmorphic cards with backdrop blur
- Two heading levels: top-level (no bar) and step sub-headings (blue left bar)
- Dark mode via CSS custom properties — no color distortion in dark mode
- Responsive: sidebar hidden on mobile, print-friendly with collapsed sections expanded
- Zero dependencies — pure HTML/CSS/JS, open in any browser

---

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | The skill prompt — install this as a Claude Code command |
| `references/template.html` | HTML template read by the AI during generation |
| `references/patterns.md` | Pattern library with 16 architecture patterns and analogies |
| `install.js` | NanoClaw installer — copies all files to `container/skills/explain-codebase/` |
| `nanoclaw-architecture.html` | Live example output — NanoClaw architecture doc |

---

## License

MIT
