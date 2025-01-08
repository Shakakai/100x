---
layout: post
title: "AI-Assisted Writing: Foundations and Setup (Part 1)"
date: 2024-10-18
image: /images/posts/ai-writing-part-1.png
description: A guide to setting up AI-generated text, covering writing style, rules for LLMs, and document structure.
---

In this series, I'll show you how to generate high-quality AI-generated text for various use cases from code. You'll need to be familiar with Python 3.9+ to follow along. Here's an outline of the series:

1. **Part 1: Foundations & Setup**
2. **Part 2: Reddit Comment Writer (The Basics)**
3. **Part 3: A Reddit Comment Agent (Evals & Optimizations)**
4. **Part 4: A Blog Post Writing Agent (Multi-Step Agents)**

Before we dive into coding, it's crucial to gather some foundational information about the document you're aiming to create. This involves considering the writing style, defining the rules for the AI language model (LLM), deciding on the document structure, and identifying the criteria you'll use to evaluate the results.

## Defining the Writing Style

The first step in creating effective AI-generated text is identifying the desired writing style. Answering the following questions will help you refine the style you're aiming for:

- Can you collect relevant examples for the AI to learn from? High-quality examples guide the model.
- What reading level are you targeting? Is it for a general audience (Grade 6 and below), a more educated one (up to Grade 12), or a highly specialized academic audience (college level and beyond)?
- Are there specific writing styles to avoid, such as passive voice, split infinitives, or unnecessary wordiness?
- Do you require gender-inclusive language, or do you prefer a more traditional approach?

By clearly defining the style, you provide the LLM with concrete examples of what you do and do not want, improving the quality and consistency of the output.

## Establishing Writing Rules for the LLM

Although the writing style provides general guidance, you'll also need to define specific writing rules for the LLM. Consider these areas:

- **Dates and numbers:** How should they be represented? Is it "October 18, 2024" or "18/10/2024"?
- **Capitalization rules:**
  - What casing should be used for titles and headings? (e.g., Title Case or sentence case?)
  - Should proper names always be capitalized?
  - Should terms like "Internet" or "Web" be capitalized?
- **Acronyms:** Are they allowed? Should they be spelled out initially, or used throughout the document?
- **Emoji:** Will you use them? If so, which ones and where?
- **Punctuation:** Should certain punctuation marks be avoided or used sparingly? For example, will you allow ellipses?

Clearly defined rules like these help ensure that the generated text aligns with your brand or style preferences.

## Structuring the Document

The structure of the document heavily depends on its purpose and the intended audience. You should address the following questions:

- **What is the main objective of the document?** Are you aiming to inform, persuade, explain, or describe something?
- **Who is the audience?** Tailor your tone, language, and detail to the background, knowledge, and expectations of the reader. For technical documents, consider how deep or surface-level the technical knowledge should be.
- **What is the core message or argument?** Identify the key points and details necessary to support your main argument.
- **What is the best way to organize the information?** Should the document follow a chronological order, a cause-and-effect structure, or perhaps a problem-solution format?
- **What kind of introduction is needed?** Provide an overview or background that prepares the reader for the content to follow.
- **How do the sections flow together?** Ensure smooth transitions between sections to maintain a coherent reading experience.
- **What supporting documents are needed?** Determine if additional resources, such as research papers or case studies, should be included.
- **How do you conclude?** Summarize key points, restate the main message, and suggest further actions or reflections.

A well-structured document is easier to read and understand, enhancing its overall effectiveness.

## Defining Criteria for Evaluation

Once the document is generated, how will you judge its success? Since you'll be using an LLM to evaluate the results, it's important to establish clear criteria to make the evaluation as straightforward as possible. Here are some examples:

- **Brand alignment:** Is the document consistent with your brand's tone and messaging (e.g., "Is this document on brand for Coca-Cola?")?
- **Content sensitivity:** Is there any potentially objectionable material in the document?
- **Adherence to writing rules:** Does the document follow all the style and writing rules you've outlined?

When we get to agents, these criteria will be rated on a scale of 1-10, with specific feedback provided for improvements. The agents we build will use the feedback to improve the quality of the generated text, allowing for iterative optimization.

## Conclusion

This may feel like a lot of groundwork before getting into the code, but you've already completed 80% of the job by now. Successful AI-generated content depends on well-defined inputs (writing style, LLM rules, and document structure) and output validation (evaluation criteria).

In the next installment, I'll show you how to create a social media post based on a web URL. We'll test it on several articles to see how it performs and where it might need improvement. Stay tuned!