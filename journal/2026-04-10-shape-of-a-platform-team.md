---
title: On the shape of a platform team
date: 2026-04-10
tags: platform, teams, distributed-systems
excerpt: A platform team exists to delete work from product teams. Everything else is vanity.
---

# On the shape of a platform team

A platform team exists to **delete work from product teams**. Everything else — the tooling, the internal conference talks, the roadmap with fifteen pillars — is vanity.

## The test

For any piece of infrastructure we own, I ask: *if we deleted it tomorrow, which product teams would notice, and how fast?* If the answer is "none, eventually," the thing is dead weight, no matter how technically interesting it is.

## What survives the test

At N26, the pieces that consistently pass:

- **Idempotent ingestion** — teams stop writing their own deduplication logic.
- **A canonical transaction event** — teams stop joining five tables to reconstruct one fact.
- **GDPR deletion as a service** — teams stop building 20 different deletion flows that don't compose.

## What dies

- Opinionated frameworks nobody asked for.
- Abstraction layers that exist "for flexibility" but never get flexed.
- Dashboards built for platform engineers, not for the product teams paying the bill.

The discipline is ruthless prioritization. Most platform work is boring on purpose, because the best platform is the one you stop thinking about.
