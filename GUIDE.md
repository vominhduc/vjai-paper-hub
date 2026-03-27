# 📖 VJAI Paper Hub — User Guide

This guide explains how to use the website as a community member.

---

## Overview

VJAI Paper Hub runs a monthly AI/ML paper reading cycle with four phases:

| Phase | What happens |
|-------|-------------|
| **Nominating** | Members nominate papers they commit to **present** at the Exploration session |
| **Exploration session** | Each nominator gives a short presentation of their paper to the group |
| **Voting** | After all presentations, the community 👍-votes to pick one paper for Deep Dive |
| **Deep-Dive session** | The winning paper gets a full 90-minute session — reproduced code, deep discussion |

> The key distinction: **nominating = committing to present**. Voting happens *after* the Exploration session, once everyone has seen all the papers.

---

## Pages

| Page | URL | What it's for |
|------|-----|---------------|
| Home | `/` | Overview, active cycle status, recent archive |
| Seeds | `/seeds` | Nominate papers & see all nominations for active cycles |
| Cycle | `/cycle` | Full detail of every cycle — nominations, votes, session info |
| Roadmap | `/roadmap` | Year-at-a-glance: all 8 cycles and their status |
| Archive | `/archive` | Past sessions — recordings, notes, reproduced code |

---

## How to Nominate a Paper

Nominating means you are **volunteering to present that paper** at the Exploration session. Each nomination = one presenter slot.

Nominations are open until the `nomination_end` date shown on the cycle card.

### Option A — Nominate an organizer suggestion (Seeds page)

1. Go to **Seeds** (`/seeds`)
2. Find a card with a **🌱 Seed** badge — these are papers suggested by organizers but not yet nominated
3. Click **+ Nominate** on the card
4. A pre-filled GitHub issue opens with the paper title, arXiv URL, and cycle ID already filled in
5. Fill in:
   - **Your Name / Handle** — how you'll be credited as presenter
   - **Tags** — topic keywords (e.g. `LLM, Reasoning`)
   - **Why should the group explore this paper?** — a short pitch
6. Submit the issue — the bot adds it to the cycle pool within minutes

### Option B — Nominate your own paper

1. Go to **Seeds** (`/seeds`) or **Cycle** (`/cycle`)
2. Click the orange **+ Nominate** button in the cycle header
3. On the GitHub issue form, fill in all fields:
   - **Your Name / Handle**
   - **Cycle ID** — already pre-filled (e.g. `2026-apr`)
   - **arXiv URL** — e.g. `https://arxiv.org/abs/2501.12948`
   - **Tags** — comma-separated
   - **Why should the group explore this paper?**
4. Submit — automation picks it up automatically

> ⚠️ **Commitment:** By nominating, you are agreeing to give a short presentation of that paper at the Exploration session. Please only nominate if you can attend.

---

## How to Vote

Voting opens after the **Exploration session** and stays open for 3 days.

1. Go to **Seeds** (`/seeds`) or **Cycle** (`/cycle`)
2. During the voting phase, each nomination card shows a **"Vote for Deep Dive"** button
3. Click it — the corresponding GitHub issue opens
4. React with **👍** on that issue
5. Votes sync every 6 hours — the vote bar on each card updates accordingly

The paper with the most 👍 reactions when voting closes becomes the **selected paper** for the Deep Dive session.

> You can vote for as many papers as you like, and change your vote at any time before voting closes by removing/adding 👍 reactions.

---

## Card Badges Explained

| Badge | Meaning |
|-------|---------|
| 🌱 **Seed** | Organizer suggestion — not yet formally nominated |
| 🗳 **Nominated** | A member has committed to present this paper at the Exploration session |
| ⚡ **Selected** | Won the community vote — will be deep-dived at the next session |
| ✓ **Done** | Session completed, notes & recording available in the Archive |

---

## Cycle Phases

| Phase | What's happening |
|-------|-----------------|
| **Nominations Open** | Submit papers you'll present at the Exploration session |
| **Voting** | Exploration session done — cast 👍 to pick the Deep Dive paper |
| **Deep-Dive** | Paper selected, full session date confirmed — read it! |
| **Completed** | Session done, recording & notes in Archive |

---

## Joining a Session

- The **Exploration session** date is shown as "Exploration" on cycle cards — attend to hear all presentations and cast your vote
- The **Deep Dive session** date is shown as "Deep Dive" on cycle cards
- Click **Join Session** on the Deep Dive panel to find session logistics (meeting link, pre-reads) on GitHub Discussions

---

## Planned Cycles

Cycles more than one month out are marked **Planned** on the Roadmap. Their dates are not fixed yet. Check back as they become active to see the theme and start nominating.

---

## FAQ

**Can I nominate more than one paper per cycle?**
Yes, but each nomination is a commitment to present — only nominate papers you can actually present.

**What makes a good nomination?**
Recent papers (past 12 months) with available code or arXiv preprints, and a clear "why now" angle, tend to get the most votes after the Exploration session.

**I submitted a GitHub issue but the paper didn't appear on the site?**
Make sure the issue has the `nomination` label. The automation fires on label events. If it's missing, add it manually or ask an organizer.

**Votes haven't updated on the site?**
Votes sync every 6 hours. If your 👍 was recent, wait for the next sync.

**Can I change my vote?**
Yes — remove your 👍 from one issue and add it to another at any time before voting closes.


---

## Pages

| Page | URL | What it's for |
|------|-----|---------------|
| Home | `/` | Overview, active cycle status, recent archive |
| Seeds | `/seeds` | Nominate papers & see all nominations for active cycles |
| Cycle | `/cycle` | Full detail of every cycle — nominations, votes, session info |
| Roadmap | `/roadmap` | Year-at-a-glance: all 8 cycles and their status |
| Archive | `/archive` | Past sessions — recordings, notes, reproduced code |

---

## How to Nominate a Paper

You can nominate any AI/ML paper for the **current active cycle** during its **Nominations Open** phase.

### Option A — Nominate an organizer suggestion (Seeds page)

1. Go to **Seeds** (`/seeds`)
2. Find a card with a **🌱 Seed** badge — these are papers suggested by the organizers but not yet formally nominated
3. Click **+ Nominate** on the card
4. A pre-filled GitHub issue opens in a new tab with the paper title, arXiv URL, and cycle ID already filled in
5. Fill in:
   - **Your Name / Handle** — how you want to be credited
   - **Tags** — topic keywords (e.g. `LLM, Reasoning`)
   - **Why should we read this?** — a short pitch for the paper
6. Submit the issue — the bot will add it to the cycle pool within minutes

### Option B — Nominate your own paper

1. Go to **Seeds** (`/seeds`) or **Cycle** (`/cycle`)
2. Click the **+ Nominate** button in the cycle header (orange button, top-right of the active cycle section)
3. On the GitHub issue form, fill in all fields:
   - **Your Name / Handle**
   - **Cycle ID** — already pre-filled (e.g. `2026-apr`)
   - **arXiv URL** — full URL like `https://arxiv.org/abs/2501.12948`
   - **Tags** — comma-separated
   - **Why should we read this?**
4. Submit the issue — automation picks it up automatically

> **Note:** Nominations are only accepted for cycles with status **Active** during the nominating phase. Submitting for a planned or past cycle will be rejected by the bot.

---

## How to Vote

Voting is open for **3 days** after the nomination phase ends (the "Exploration" phase).

1. Go to **Seeds** (`/seeds`) or **Cycle** (`/cycle`)
2. Find a nomination card during the voting phase — it will show a **"Vote for Deep Dive"** button
3. Click it — it opens the corresponding GitHub issue
4. React with **👍** on that issue
5. Votes are synced automatically every 6 hours — the vote bar on each card updates accordingly

> You can vote for as many papers as you like. The paper with the most 👍 reactions when voting closes becomes the **selected paper** for the Deep-Dive session.

---

## Card Badges Explained

| Badge | Meaning |
|-------|---------|
| 🌱 **Seed** | Organizer suggestion — not yet formally nominated |
| 🗳 **Nominated** | Submitted to the cycle pool and open for voting |
| ⚡ **Selected** | Won the community vote — this paper will be deep-dived |
| ✓ **Done** | Session completed, notes available in the Archive |

---

## Cycle Phases

| Phase | What's happening |
|-------|-----------------|
| **Nominations Open** | Submit new papers via GitHub issues |
| **Voting** | Cast 👍 reactions on existing nomination issues |
| **Deep-Dive** | Paper selected, session date confirmed, read it! |
| **Completed** | Session done, recording & notes in Archive |

---

## Following Along / Joining a Session

- Watch the **Cycle** page (`/cycle`) — it shows the confirmed Deep-Dive date and agenda once a paper is selected
- Click **Join Session** on the Deep-Dive panel to go to the GitHub Discussions page where session logistics (meeting link, pre-reads) are posted

---

## Planned Cycles

Cycles more than one month out are marked **Planned** on the Roadmap. Their dates are not fixed yet — check back as they become active. You can still browse the theme to know what category of papers will be in scope.

---

## Frequently Asked Questions

**Can I nominate more than one paper per cycle?**
Yes — there is no limit. Each paper needs its own GitHub issue.

**What makes a good nomination?**
Papers that are recent (past 12 months), have available code or arXiv preprints, and have a clear "why now" angle tend to attract the most votes.

**I submitted a GitHub issue but the paper didn't appear on the site?**
Make sure the issue has the `nomination` label applied. The automation runs on label events. If it's missing, add the label manually or ask an organizer.

**Votes haven't updated on the site?**
Votes sync every 6 hours. If your 👍 was very recent, wait for the next sync window.

**Can I change my vote?**
Yes — remove your 👍 reaction from one issue and add it to another at any time before voting closes.
