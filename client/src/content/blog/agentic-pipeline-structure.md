---
slug: agentic-pipeline-structure
title: "Inside XMem's Agentic Pipeline Structure"
description: "How XMem uses classifier, domain agents, judge-before-write, and weaver stages to make long-term agent memory reliable instead of noisy."
date: "2026-05-29"
author: "XMem Team"
tags: "Architecture, Agentic Memory, Pipeline"
heroImage: "/blog/agentic-pipeline.svg"
---

## Memory needs an operating system

LLM apps already have context windows, vector databases, and chat transcripts. What they usually do not have is a disciplined memory operating system. A memory layer has to decide what matters, where it belongs, whether it conflicts with older facts, and how it should be retrieved later.

XMem's pipeline is built around that problem. It treats memory as a staged agentic workflow, not a raw append-only log. The result is a first-of-its-kind structure for XMem: specialized agents propose memory, an independent judge validates mutations, and a weaver applies only the operations that survive review.

![XMem agentic pipeline structure](/blog/agentic-pipeline.svg)

## The pipeline in one pass

Every ingest request starts as a conversation turn: `user_query`, `agent_response`, `user_id`, optional `session_datetime`, optional `image_url`, and an `effort_level`. From there the pipeline moves through five stages.

- **Classifier** decides which memory domains should inspect the turn.
- **Domain agents** extract candidate memories for profile, temporal, summary, code, snippet, or image.
- **Judge** compares those candidates with existing memory and decides `add`, `update`, `delete`, or `skip`.
- **Weaver** commits approved operations to the storage layer and reports what succeeded.
- **Retrieval** later searches those domains and synthesizes an answer with sources.

That separation is the important part. The extraction agent is not allowed to write directly. The judge is not responsible for storage mechanics. The weaver does not invent new facts. Each component has one job, so failures are easier to see and easier to correct.

## Why judge-before-write is the core idea

Most memory systems fail quietly because they save too much. They treat every user sentence as durable truth, then retrieval becomes a fight against duplicates, stale claims, and accidental preferences.

XMem flips the default. Candidate memory is only a proposal. The Judge can reject duplicates, merge a newer preference into an older one, delete stale temporal claims, or skip low-confidence noise. Every approved operation carries a reason, which means memory changes are inspectable instead of magical.

> Durable memory should feel less like a transcript and more like a maintained knowledge base.

## Domains keep memory useful

The domain split makes retrieval sharper. A user's long-lived preferences belong in profile memory. A dated appointment belongs in temporal memory. A project decision may become summary memory. A reusable command can become snippet memory. Repository symbols and relationships live in code memory.

This matters because the retrieval path can ask different stores different questions. A product agent looking for user preferences should not sift through every code chunk. A coding agent asking where auth lives in a repository should use code memory and graph context, not a generic chat summary.

## How this connects to the rest of XMem

The same pipeline powers multiple surfaces:

- REST clients call [the API reference](/docs/rest-api) directly.
- TypeScript and Python users can build against [the SDK contracts](/docs/sdks).
- MCP clients reach memory through [xmem-mcp](/docs/mcp-server).
- Claude Code, Codex, Cursor, Hermes, OpenClaw, and OpenCode use [agent connectors](/docs/agent-connectors).
- Browser workflows use [the Chrome extension](/docs/chrome-extension).
- Repository work flows through [scanner and code memory](/docs/scanner-code-memory).

This is why XMem is not just a vector database wrapper. The storage layer matters, but the pipeline is what decides whether memory stays useful after thousands of turns and many different agents.

## What comes next

The next frontier is making the pipeline more visible: versioned memories, richer operation logs, domain-level debugging, and source connector sync for Notion and Google Drive. The design goal stays the same: agents should remember with discipline, not just with capacity.
