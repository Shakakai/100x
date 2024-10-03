---
layout: post
title: OpenAI Dev Day - October 2024
date: 2024-10-03
---


A few updates from OpenAI's Dev Day (from an engineer's perspective):

# Multimodal fine-tuning

You can now finetune OpenAI's vLLM capabilities on your own data. This means you can teach their models how to extract information from images in exactly the way your organization needs it. There have been open source models available to do this for quite some time but OpenAI's fine-tuning APIs make this process MUCH EASIER.

# Prompt-Caching

Each token you send to OpenAI costs money. Very often you send the same text prompts to do the same type inference work. Previously, you were charged for those repeated bits of text on each request and the costs added up. Now, if you send the same set of token, you'll get a 50% discount with no code changes.

# Model Distillation

They added some tools to make it faster and easier to teach a smaller (think faster and cheaper) model to work like their SOTA model (gpt-4o right now). This is great news for applications where cost or speed are limiting factors to deploying AI features.

# Realtime API

This was a big announcement that I'm not particularly excited about. It allows you to easily build a voice assistant on top of their gpt-4o model. The problem is they decided to use a streaming technology called websockets that are both unreliable and have serious latency issues. This will work well for call center infrastructure (where internet speeds are reliably high) but any application that needs to be used over a cell network or unreliable internet will be frustratingly flaking to end users. I have built voice applications and seen how bad websockets are for consumer applications and they are essentially a non-starter. I was hoping they'd be working with a WebRTC provider (the correct technology for streaming audio and video) to do this properly. I guess we'll have to wait and see if that happens at the next big event.

# Final Thoughts

OpenAI has made significant strides in supporting the productization of LLM features with this release. They have empowered developers to substantially reduce the cost of LLM calls, enhance response speed, and improve the accuracy of LLM outputs. However, a critical challenge remains: there is no industry consensus on the best practices for developing and maintaining evaluations (evals) for AI-driven features. This raises important questions: How can one determine if an LLM feature deployed a year ago is still performing as intended? When should development resources be allocated for feature reassessment?

In traditional deterministic software, revisiting code was typically unnecessary unless errors appeared in logs. Probabilistic systems like LLMs, however, do not afford this luxury. The absence of a standardized solution for ongoing evaluation and maintenance of LLM features presents a significant challenge. Either OpenAI or the open-source community needs to address this gap, or the industry may face substantial rework of LLM features in the future. This underscores the need for robust, scalable evaluation frameworks to ensure the long-term reliability and effectiveness of AI-driven applications.