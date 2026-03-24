---
title: "LoRA: Low-Rank Adaptation of Large Language Models"
conference: "ICLR"
year: 2022
status: "Reproduced"
presenter: "Duc Vo"
tags: ["LLM", "Fine-tuning", "Efficiency"]
date_read: "2026-03-22"
vibeScore: 95
resources:
  arxiv: "https://arxiv.org/abs/2106.09685"
  github: "https://github.com/microsoft/LoRA"
  vjai_code: "https://github.com/vjai/lora-repro"
  youtube: "https://youtube.com"
  blog: "https://vjai.dev/blog/lora"
summary: "An efficient way to fine-tune LLMs by only updating low-rank matrices, reducing trainable parameters by 10,000x."
---

## Why This Paper Matters

LoRA (Low-Rank Adaptation) solved one of the most practical problems in applied LLM research:
**how do you customize a 70B model when you only have a single GPU?**

Before LoRA, full fine-tuning required maintaining copies of all gradients and optimizer states,
making it infeasible for most researchers and engineers.

## Core Idea

Instead of updating the full weight matrix **W ∈ ℝ^(d×k)**, LoRA approximates the update as:

```
ΔW = BA  where B ∈ ℝ^(d×r), A ∈ ℝ^(r×k), r ≪ min(d,k)
```

Only **A** and **B** are trained. **W** stays frozen.

## Key Results

| Model | Method | ROUGE-1 | Trainable Params |
|---|---|---|---|
| GPT-3 175B | Full FT | 47.2 | 175B |
| GPT-3 175B | LoRA (r=4) | 47.1 | 4.7M |
| GPT-3 175B | LoRA (r=8) | 47.4 | 9.4M |

## Reproduction Notes

We reproduced LoRA on LLaMA-2-7B for Vietnamese instruction following using the Bactrian-X dataset.

Key implementation details:
- Applied LoRA to Q, V projection matrices only
- Rank r=16, alpha=32
- Trained on 1× RTX 4090 for 3 hours

## Community Discussion

The VJAI session surfaced an interesting insight: the choice of **which layers to apply LoRA to** matters significantly.
Applying to all linear layers (including FFN) improved our Vietnamese benchmark by ~4%.
