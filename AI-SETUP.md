# AI Tools Setup

This workspace is configured for two AI coding assistants: **GitHub Copilot** and **Claude Code**. Each reads from its own folder and is fully independent — they don't conflict.

---

## Folder Structure

```
.github/                                  ← GitHub Copilot reads this
│
├── copilot-instructions.md               ← Always-on workspace context
└── instructions/
    └── power-apps-code-apps.instructions.md  ← Code rules for .ts/.tsx/.json files

.claude/                                  ← Claude Code reads this
│
├── agents/
│   ├── pa-plan.md                        ← Planning agent
│   ├── pa-code.md                        ← Development agent
│   ├── pa-review.md                      ← Review agent
│   └── pa-document.md                    ← Documentation agent
├── skills/
│   └── power-apps-code-apps/
│       ├── SKILL.md                      ← /power-apps-code-apps skill
│       └── reference.md                  ← Detailed CLI & pattern reference
└── settings.json                         ← Hooks (format on save, block generated files)
```

---

## GitHub Copilot

### What loads automatically

| File | When it loads | What it does |
|---|---|---|
| `copilot-instructions.md` | Every session | Workspace-wide context: architecture, CLI conventions, key rules |
| `power-apps-code-apps.instructions.md` | When editing `.ts`, `.tsx`, or `.json` | Strict code rules: generated file protection, SDK patterns, hook requirements |

### How to use agents

Agents are no longer defined in `.github/agents/` — see the Claude Code section below. In GitHub Copilot Chat, use `@workspace` with natural language:

```
@workspace plan the data source architecture for a leave-request app
@workspace review this hook for DLP compliance issues
```

### What Copilot does not have

- Agents (use Claude Code instead)
- Skills / slash commands (use Claude Code instead)
- Hooks (use Claude Code instead)

---

## Claude Code

### What loads automatically at session start

| What | Cost | Source |
|---|---|---|
| `CLAUDE.md` (if present) | Full content | Repo root |
| Agent descriptions | ~10 tokens each | `.claude/agents/*.md` frontmatter `description:` |
| Skill descriptions | ~10 tokens each | `.claude/skills/**/SKILL.md` frontmatter `description:` |
| Hooks | No tokens | `.claude/settings.json` |

Full agent and skill content only loads when actually invoked — keeping the base session cost low.

### Agents

Four agents are available. Claude routes to them automatically based on your request, or you can ask explicitly.

| Agent | File | When Claude picks it | Invoke explicitly |
|---|---|---|---|
| **PA Plan** | `pa-plan.md` | "plan", "architect", "design", "what connectors", "component tree" | `use the PA Plan agent to...` |
| **PA Code** | `pa-code.md` | "build", "write", "create", "implement", "hook", "component" | `use the PA Code agent to...` |
| **PA Review** | `pa-review.md` | "review", "check", "audit", "DLP", "security" | `use the PA Review agent to...` |
| **PA Document** | `pa-document.md` | "document", "README", "runbook", "write docs" | `use the PA Document agent to...` |

Each agent runs in an **isolated context** — its own token budget, separate from your main conversation.

**Example prompts that auto-route:**
```
plan the connector strategy for an expense tracker    → PA Plan
write a hook called useLeaveBalance                   → PA Code
review my hooks folder for security issues            → PA Review
document the data sources used in this app            → PA Document
```

### Skill — `/power-apps-code-apps`

A slash-command skill that loads quick-start commands, SDK patterns, and Power Platform conventions into your conversation.

**Invoke it:**
```
/power-apps-code-apps
```

**With a question:**
```
/power-apps-code-apps how do I add a Dataverse table as a data source?
/power-apps-code-apps what is the correct import for getContext?
```

The skill description is always in context (low cost). Full content only loads when you invoke it.

### Hooks

Hooks in `.claude/settings.json` run as shell scripts — they fire deterministically around every file edit, with no LLM involvement.

| Hook | Trigger | What it does |
|---|---|---|
| **Block generated files** | Before any edit to `.ts`/`.tsx`/`.json` | Checks if the file is `power.config.json` or under `src/generated/` — blocks the edit and shows a BLOCKED message |
| **Format on save** | After any edit to `.ts`/`.tsx`/`.json` | Runs `npx prettier --write` on the file automatically |

**To test the block hook:** ask Claude to edit `power.config.json`. It should be stopped before the edit happens.

**To test the format hook:** ask Claude to create any `.ts` file — it will be auto-formatted after writing.

**Requirement:** hooks use `python3` to parse JSON. Run `python3 --version` in the terminal to confirm it's available. Prettier must be installed in the project (`npm install`).

---

## How They Differ

| Feature | GitHub Copilot | Claude Code |
|---|---|---|
| Always-on workspace context | ✅ `copilot-instructions.md` | ✅ `CLAUDE.md` |
| File-type specific instructions | ✅ `instructions/*.instructions.md` | ✅ `.claude/rules/` (if created) |
| Custom agents | ❌ | ✅ `.claude/agents/` |
| Slash-command skills | ❌ | ✅ `.claude/skills/` |
| Hooks (pre/post tool use) | ❌ | ✅ `.claude/settings.json` |
| Inline completions | ✅ | ❌ |
| Chat in editor | ✅ | ✅ |

Use **GitHub Copilot** for inline code completions and quick edits.
Use **Claude Code** for agents, planning, review, and complex multi-step tasks.

---

## Testing the Setup

### GitHub Copilot
Open Copilot Chat and ask:
```
What are the rules for editing generated files in this workspace?
```
It should reference the `power.config.json` and `src/generated/` protection rules from the instructions files.

### Claude Code — agents
```
plan the component hierarchy for a task manager app
```
Claude should route to PA Plan and produce a structured seven-section plan.

### Claude Code — skill
```
/power-apps-code-apps
```
Claude should confirm the skill loaded and show SDK patterns and CLI commands.

### Claude Code — block hook
```
add a comment to power.config.json
```
Claude should be blocked before making any change.

### Claude Code — format hook
Ask Claude to create any `.ts` file — check that it's formatted when you open it.
