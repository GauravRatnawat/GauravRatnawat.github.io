---
title: Notes from a migration I'm still in the middle of
date: 2026-01-20
tags: migrations, strangler-fig, platform
excerpt: Three months in, one migration lesson keeps recurring: the old system is a teacher, not an enemy.
---

# Notes from a migration I'm still in the middle of

Three months into migrating a critical service to the new Transaction Data Platform and one lesson keeps recurring: **the old system is a teacher, not an enemy.**

## The temptation

The temptation is to dismiss the legacy system — "it's spaghetti, rewrite it clean." But every inelegant thing in a legacy system was usually written to survive a real production incident. The ugly branch, the retry with jitter, the weird timeout — each has a story.

## What I do now

Before deleting anything from the old code path, I ask:

- What incident was this written in response to?
- Is that incident still possible in the new design?
- If yes, how does the new design handle it?

Half the time the answer is "we already handle it better." The other half, I just saved myself from reliving someone else's 2am.

## The real migration

The real migration isn't the code. It's transferring the *tacit knowledge* encoded in the old system into the new one. That happens in design reviews, pairing sessions, and patient conversations with the engineers who wrote the thing — not in PR descriptions.
