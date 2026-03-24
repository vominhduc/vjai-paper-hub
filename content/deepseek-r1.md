---
title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning"
conference: "Preprint"
year: 2025
status: "Reading"
presenter: "Duc Vo"
tags: ["LLM", "RL", "Reasoning"]
date_read: "2026-04-12"
vibeScore: 88
resources:
  arxiv: "https://arxiv.org/abs/2501.12948"
  github: "https://github.com/deepseek-ai/DeepSeek-R1"
  vjai_code: ""
  youtube: ""
  blog: ""
summary: "Trains LLMs to reason purely via RL without supervised fine-tuning cold start, rivalling OpenAI o1."
---

## Why This Paper Matters

DeepSeek-R1 demonstrates that **pure reinforcement learning, with no SFT cold-start**, can produce
o1-level reasoning in open-weight models. This is a landmark result that challenges the assumption
that RLHF always needs supervised warm-up.

## Core Algorithm: GRPO

Group Relative Policy Optimization (GRPO) estimates the baseline from group samples rather than a
separate value model, dramatically reducing memory cost vs PPO:

```
Reward(output) = Format Reward + Accuracy Reward
```

The model learns to emit `<think>...</think>` chains internally before answering.

## Key Results

| Benchmark | DeepSeek-R1 | OpenAI o1 |
|---|---|---|
| AIME 2024 | 79.8% | 79.2% |
| MATH-500 | 97.3% | 96.4% |
| LiveCodeBench | 65.9% | 63.4% |
| GPQA Diamond | 71.5% | 75.7% |

## Session Agenda

1. Paper motivation: why pure RL for LLM reasoning?
2. GRPO algorithm walkthrough
3. Cold-start vs. no cold-start ablation analysis
4. Live Ollama demo with DeepSeek-R1-7B
5. Open Q&A

## Pre-reading Checklist

- [ ] Skim the GRPO section (§3.2) before the session
- [ ] Install Ollama locally: `brew install ollama`
- [ ] Pull the model: `ollama pull deepseek-r1:7b`
