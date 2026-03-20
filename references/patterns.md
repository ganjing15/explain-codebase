# Architecture Pattern Library

Reference library of common architecture patterns with analogies, detection signals, and what to extract. Use these as a starting point when analyzing a codebase in Phase 3. If you find patterns not in this list, write your own analogy and explanation following the same format.

For each pattern you find — whether from this list or not — include:
- A plain-English name (not the technical term if it confuses non-coders)
- An everyday analogy that makes someone nod before reading any technical detail
- What signs pointed to this pattern in the codebase
- Key files/functions involved (verified)

---

## Pattern: Webhook receiver
- **What it is**: A URL that external services call to deliver events
- **Analogy**: A doorbell — instead of constantly checking if someone is there, you wait for the ring
- **Signs**: HTTP server on a specific port, event type routing, challenge/verification logic
- **Key info to extract**: port, event types handled, verification method

## Pattern: Message queue / per-entity queue
- **What it is**: Messages wait in line so processing happens one at a time per entity
- **Analogy**: A single checkout lane per customer — no two clerks serving the same person at once
- **Signs**: Queue data structure, mutex/lock per entity, dequeue/enqueue functions
- **Key info to extract**: queue type, concurrency model, idle/timeout behavior

## Pattern: Container / sandbox isolation
- **What it is**: Each task runs in a throwaway isolated environment
- **Analogy**: A disposable lunchbox — packed fresh, used once, thrown away. Nothing leaks out
- **Signs**: Docker/container API calls, mount configurations, --rm flag, credential injection
- **Key info to extract**: what's mounted, what's read-only, what's injected, lifecycle

## Pattern: Credential proxy
- **What it is**: A local middleman that injects real secrets so workers never hold them
- **Analogy**: A hotel concierge — guests make requests requiring the master key, but never touch it
- **Signs**: Placeholder API keys, base URL redirection to localhost, token swap logic
- **Key info to extract**: port, what credentials are proxied, auth modes

## Pattern: File-based IPC
- **What it is**: Two processes communicate by writing/reading files in a shared directory
- **Analogy**: A mail slot — drop a note in, someone on the other side reads and acts on it
- **Signs**: fs.watch / inotify, JSON files written to a watched directory, response files
- **Key info to extract**: watched directories, message types, response mechanism, security/namespacing

## Pattern: Task scheduler / cron
- **What it is**: Tasks fire automatically at scheduled times, even without user input
- **Analogy**: A programmable alarm clock that can run anything, not just make noise
- **Signs**: Cron expression parsing, scheduled_tasks table, recurring vs one-shot, fire-and-spawn
- **Key info to extract**: storage mechanism, check interval, task types, persistence across restarts

## Pattern: Channel abstraction
- **What it is**: A unified interface so the core system doesn't care which messaging platform is used
- **Analogy**: A universal power adapter — same device, different plugs for different countries
- **Signs**: Interface/protocol definition, multiple implementations (email.ts, sms.ts, slack.ts), registry
- **Key info to extract**: interface methods, which channels exist, how they're registered

## Pattern: Router / dispatcher
- **What it is**: Directs incoming messages to the right handler based on rules
- **Analogy**: A post office sorting room — each letter goes to the right person based on the address
- **Signs**: Group/channel lookup tables, trigger pattern matching, allowlist checking
- **Key info to extract**: routing rules, trigger conditions, fallback behavior

## Pattern: Agent / AI worker
- **What it is**: An AI model that can use tools and reason over multiple steps
- **Analogy**: A smart intern with a Swiss Army knife — you give it a task, it figures out the steps
- **Signs**: LLM SDK calls, tool definitions, system prompt loading, session/context management
- **Key info to extract**: model used, tools available, memory/context approach, output format

## Pattern: Plugin / skill system
- **What it is**: Modular capabilities that can be added without changing the core system
- **Analogy**: App store for the AI — install a skill and new capabilities appear
- **Signs**: Skills directory, dynamic loading, markdown instruction files, tool injection
- **Key info to extract**: how skills are discovered, how they're injected, what they can do

---

## Pattern: MVC / MVVM
- **What it is**: Separates data (model), display (view), and logic (controller/view-model) into distinct layers
- **Analogy**: A restaurant — the kitchen (model) prepares the food, the waiter (controller) takes orders and delivers plates, the menu (view) shows what's available
- **Signs**: Separate directories for models/views/controllers, data binding between views and models, clear separation of business logic from rendering
- **Key info to extract**: which layer handles what, how data flows between layers, where business rules live

## Pattern: Middleware pipeline
- **What it is**: Requests pass through a chain of handlers, each adding or checking something before the next
- **Analogy**: An assembly line — each station does one thing (stamp, paint, inspect) to the item passing through, and any station can reject it
- **Signs**: `app.use()` calls, `next()` function, ordered chain of handlers, request/response transformation
- **Key info to extract**: middleware order, what each middleware does, error-handling middleware

## Pattern: Repository / data access layer
- **What it is**: A clean boundary between business logic and database operations
- **Analogy**: A librarian — you ask for a book by topic, not by shelf number and row. The librarian knows where things are stored so you don't have to
- **Signs**: Classes/modules that wrap database queries, methods like `findById`, `save`, `delete`, no raw SQL in business logic
- **Key info to extract**: which entities have repositories, query patterns, caching strategy

## Pattern: Event emitter / pub-sub
- **What it is**: Components communicate by broadcasting events that any listener can respond to
- **Analogy**: A radio broadcast — anyone tuned to the right frequency hears the message, and the broadcaster doesn't need to know who's listening
- **Signs**: `on()` / `emit()` / `subscribe()` calls, event name strings, listener registration, decoupled components
- **Key info to extract**: event names, who emits vs who listens, event payload shapes

## Pattern: State machine
- **What it is**: An entity has a fixed set of states and transitions between them follow strict rules
- **Analogy**: A traffic light — it can only be red, yellow, or green, and changes follow strict rules (green → yellow → red, never green → red)
- **Signs**: Status/state enum, transition functions or maps, guards that prevent invalid transitions, state-dependent behavior
- **Key info to extract**: states, allowed transitions, what triggers each transition, side effects

## Pattern: Monorepo structure
- **What it is**: Multiple related projects share a single repository with shared tooling
- **Analogy**: A shopping mall — separate stores sharing common infrastructure (parking, security, utilities), each with its own inventory but all under one roof
- **Signs**: Workspace config (pnpm-workspace.yaml, lerna.json, nx.json), `packages/` or `apps/` directories, shared dependencies, cross-project imports
- **Key info to extract**: workspace tool, package boundaries, shared libraries, build order
