# Klick — Product plan

**Positioning:** The modern work OS where **Linear-style execution**, **Notion-style context**, and **Slack-style collaboration** meet **AI orchestration**—built for teams shipping fast in the agentic era.

**Primary audiences:** Product/engineering/ops leaders, team leads, and ICs who live across issues, docs, and chat.

---

## 1. Information architecture & URL map

Public marketing stays on the root domain; the **app** lives at a clear path prefix (e.g. `app.klick.app` or `/app` on the same domain). Below assumes **`/app`** for the authenticated product.

### 1.1 Marketing (public)

| Path | Page name | Purpose |
|------|-----------|---------|
| `/` | Home | Positioning, social proof, feature overview, CTAs |
| `/product` | Product overview | Pillars + screenshots/demos |
| `/product/issues` | Issues & cycles | Deep dive: work tracking, cycles, agents on issues |
| `/product/docs` | Docs & decisions | Deep dive: living docs, decisions, links to work |
| `/product/agents` | Agents & playbooks | Autonomy, guardrails, templates |
| `/product/integrations` | Integrations | Slack, Linear, GitHub, Notion, calendar, etc. |
| `/pricing` | Pricing | Plans, limits, FAQ |
| `/enterprise` | Enterprise | Security, SSO, SCIM, support |
| `/changelog` | Changelog | Release notes |
| `/blog` | Blog | Narrative, launches, research |
| `/docs` | Help center | User-facing help (could be separate subdomain later) |
| `/docs/api` | API reference | Developer docs |
| `/community` | Community | Forum/discord link, guidelines |
| `/careers` | Careers | Hiring |
| `/press` | Press | Media kit, contacts |
| `/brand` | Brand | Logos, colors |
| `/legal/terms` | Terms of Service | |
| `/legal/privacy` | Privacy Policy | |
| `/legal/dpa` | DPA | |
| `/security` | Trust center | SOC2, subprocessors, security contact |
| `/login` | Sign in | |
| `/signup` | Sign up | |
| `/demo` | Book a demo | Form or calendar embed |
| `/contact` | Contact sales | Form |

### 1.2 Authenticated app (`/app`)

| Path | Screen name | Purpose |
|------|-------------|---------|
| `/app` | **Home / Today** | Personal + team digest: what changed, what’s blocked, what agents did |
| `/app/inbox` | **Inbox** | Notifications, approvals, @mentions, agent proposals (Slack-like triage) |
| `/app/work` | **Work** (optional umbrella) | Redirect or hub into Issues / Projects |
| `/app/issues` | **Issues** | List/board/detail; cycles; labels; owners (Linear-like) |
| `/app/issues/:id` | Issue detail | Thread, activity, linked docs, agent runs |
| `/app/projects` | **Projects** | Roadmap containers, milestones, health |
| `/app/docs` | **Docs** | Wiki tree, pages (Notion-like) |
| `/app/docs/:id` | Doc page | Editor, comments, backlinks to issues |
| `/app/playbooks` | **Playbooks** | Reusable agent + human workflows (templates) |
| `/app/playbooks/:id` | Playbook builder | Steps, triggers, guardrails |
| `/app/runs` | **Runs** | History of agent/orchestration executions (audit) |
| `/app/integrations` | **Integrations** | Connect Slack, Linear, GitHub, Notion, etc. |
| `/app/settings` | **Settings** | Profile, notifications, theme |
| `/app/settings/workspace` | Workspace settings | Name, billing (admin) |
| `/app/settings/team` | Team & roles | Members, roles, invites |
| `/app/settings/security` | Security | SSO, API keys, audit (admin) |

**Naming principles**

- **Issues** not “tasks” (aligns with eng/product vernacular; can still serve ops).
- **Docs** not “wiki” in nav (friendlier; “wiki” can appear in marketing copy).
- **Playbooks** for orchestration (clearer than “automations” for agentic flows).
- **Inbox** for cross-channel triage (Slack metaphor users already know).
- **Runs** for transparency (trust + debugging + compliance).

---

## 2. Core feature pillars

### 2.1 Work tracking (Linear-shaped)

- Issues with states, priority, owner, cycle, project, labels.
- Keyboard-first lists/boards; filters saved as views.
- Dependencies, blockers, milestones.
- **Agent hooks:** summarize thread, propose next step, draft update comment, split issue.

### 2.2 Context & narrative (Notion-shaped)

- Docs with hierarchy, backlinks, and embeds.
- **Decision log** pattern: decision → rationale → links to issues/Slack threads.
- Living specs attached to projects; diff/history over time.
- **Agent hooks:** draft doc from issue thread, keep “definition of done” in sync, suggest stale sections.

### 2.3 Collaboration surface (Slack-shaped)

- Channels or **threads** tied to projects/issues (avoid duplicating full Slack; **mirror** and **act** from Klick).
- @mentions, reactions, lightweight presence.
- **Inbox** aggregates: Klick-native + Slack/GitHub signals (configurable).
- **Agent hooks:** daily digest, meeting recap → doc, escalate blockers to channel.

### 2.4 AI orchestration (Klick differentiator)

- **Playbooks:** trigger (schedule, event, manual) → steps (human | agent | branch).
- **Autonomy levels** per step: suggest only → draft with approval → run with guardrails.
- **Tool use** via integrations (post to Slack, open PR, update Linear if still used alongside, etc.).
- **Runs** with logs: inputs, tool calls, outputs, approver (for enterprise trust).

---

## 3. Primary user flows

### 3.1 First-time org setup (admin)

1. Sign up → create **Workspace** → invite team.
2. Connect **Slack** (and optionally Linear/GitHub/Notion).
3. Choose **import** or **fresh start** (template workspace optional).
4. Set **default playbook** (e.g. weekly sync, incident intake).
5. Land on **Today** with a short checklist (“Connect integrations”, “Create first project”, “Try a playbook run”).

### 3.2 Day-to-day IC (maker)

1. Open **Today** → scan digest (what changed overnight, agent summaries).
2. Triage **Inbox** → approve/dismiss agent proposals, reply to mentions.
3. Deep work in **Issues** or **Docs**; link doc ↔ issue.
4. Trigger or respond to **Playbook** step (e.g. “Approve launch checklist”).
5. Optional: jump to mirrored Slack thread via integration deep link.

### 3.3 Team lead

1. **Projects** health: cycle progress, blocked issues, doc staleness.
2. Configure **Playbooks** for the team (autonomy sliders, required approvers).
3. Review **Runs** for sensitive playbooks (finance, customer comms).
4. Use **Issues** views for standups (saved view: “Blocked”, “This cycle”).

### 3.4 Incident / urgent path

1. **Inbox** or Slack command creates **Issue** + **Channel thread** (via integration).
2. Playbook **Incident** runs: roles assigned, comms draft, timeline doc created.
3. Postmortem **Doc** linked to issue; **Run** archived for audit.

### 3.5 Enterprise compliance

1. SSO enforced; SCIM provisioning.
2. **Runs** retention + export; **Audit** who approved agent actions.
3. Data residency / bring-your-own-key (phase 2+ as needed).

---

## 4. UI & navigation model

### 4.1 App shell

- **Left rail:** Today, Inbox, Issues, Docs, Playbooks, Runs, (Integrations if not only in settings).
- **Top bar:** Workspace switcher, search (global: issues, docs, people), quick create (+ Issue / Doc / Run playbook), user menu.
- **Right panel (contextual):** Activity thread, AI suggestions, linked items—collapsible.
- **Command palette (⌘K):** Navigation, create, run playbook, search.

### 4.2 Visual language

- Extend current marketing tokens: warm light/dark, high legibility, restrained accent (orange family).
- **Density toggle** (comfortable / compact) for power users.
- **Agent-produced** content visually distinct (badge, subtle border) so users always know what was automated.

### 4.3 Mobile (phase 1.5+)

- **Today + Inbox + issue detail** first; full doc editing later or mobile web read-only.

---

## 5. Permissions & roles (baseline)

| Role | Capabilities |
|------|----------------|
| **Owner** | Billing, delete workspace, SSO |
| **Admin** | Members, integrations, security, playbooks publish |
| **Member** | Create/edit within projects they can access |
| **Guest** | Limited projects/issues (customer/partner) |

**Project-level** access: private team projects vs org-wide.

---

## 6. Integrations (prioritized)

**Phase 1 (MVP credibility)**

- Slack (mirror events, post updates, slash commands optional).
- GitHub (issues/PR references, commit links).
- Email (inbound to issue or inbox—optional).

**Phase 2**

- Linear (import/sync selective—many teams won’t drop Linear day one).
- Notion (import/migrate or bi-directional for docs).
- Google Calendar / Outlook (playbook triggers, meeting notes).

**Phase 3**

- Jira, Figma links, Datadog alerts → issue/playbook triggers.

---

## 7. MVP scope vs later

### MVP (v1)

- Workspace, members, projects, issues (core fields + views).
- Docs (basic editor, hierarchy, backlinks).
- Inbox (Klick-native events + Slack notifications ingest).
- One **Playbook** runtime: manual trigger, linear steps, agent assist step with approval.
- Runs history (read-only detail).
- Settings: profile, workspace name, Slack integration.
- Marketing site + auth + `/app` shell with **Today, Inbox, Issues, Docs, Playbooks, Runs**.

### v1.5

- Saved views, cycles, dependencies.
- More playbook triggers (schedule, label change).
- Search v1 (issues + docs).

### v2

- Enterprise SSO/SCIM, advanced audit.
- Deeper two-way sync (Linear/Notion).
- Mobile inbox.

---

## 8. Success metrics (north star + inputs)

- **North star:** Weekly active teams completing a **meaningful orchestration** (playbook run that touches ≥2 people or ≥2 systems).
- **Inputs:** time to first playbook run, Slack connect rate, issues linked to docs %, inbox clearance time, agent approval accept rate.

---

## 9. Open decisions (to resolve in design/dev)

- Single **“Work”** nav item vs separate **Issues** + **Projects** (recommended: separate for clarity).
- **Channels** inside Klick vs Slack-primary + Klick as control plane (recommended: start control-plane-first to avoid rebuilding Slack).
- **Pricing** packaging: seats vs orchestration runs vs AI credits (document when pricing page is designed).

---

## 10. Alignment with current marketing site

The existing landing page sections map to this plan as follows:

| Marketing block | Product anchor |
|-----------------|----------------|
| Hero | `/signup`, `/demo` |
| Logo garden | Social proof → enterprise page |
| Feature rows | `/product/issues`, `/product/docs`, `/product/integrations`, `/product/agents` |
| Testimonials | Same + case studies (future) |
| Research / careers | `/careers` |
| Frontier | `/product/agents`, `/docs/models` (or rename to “AI & models”) |
| Changelog | `/changelog` |
| Blog | `/blog` |
| Footer | Trust, legal, theme toggle |

---

*This document is the working source of truth for naming and IA until superseded by a formal PRD or design system handoff.*
