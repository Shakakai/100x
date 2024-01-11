---
layout: default
title: React Component Generator
description: The specification for the first prototype, a react component generator.
author: Todd Cullen
tags:
  - experiment  
published: true
---

# First Prototypes

## Summary
I've selected a project that I've been wanting to do for a while. 
I'm going to create a React component generator.
Like many fullstack developers, I've spent plenty of time working with React over the years.
Regardless of the countless UIs that I've built, I've never loved the process of pixel pushing to match designs.
I've always wanted to create a tool that would help me generate the starting point for a component with styling already baked in.
So that's what I'm going to build for the week of Jan 15th, 2024.

This is part of my GenAI prototype series, more on that over [here](/).

## User Stories
In this instance, a user is either a frontend developer or fullstack developer.

* As a user, I want to take a design from any design software and generate a starting point for a React component with initial styling baked in.
* As a user, I want the generated component to use the UI Library that I'm using for the project.
* As a user, I want the generated component to use the Styling system that I'm using for the project.
* As a user, I want the generated component to use my preference for either Typescript or Javascript.
* As a user, I want to control the props supplied to the component.
* As a user, I want to be able to preview the generated component with generated test data.

## Design
My goal with this design is to fulfill the user stories above and keep the scope of the build reasonable small.
I'm going to use the following mockups as the basis for the prototype.

![Landing Page](/assets/images/prototype-1-landing.png)

![Editor](/assets/images/prototype-1-editor.png)

## GenAI Approach

I'll be using OpenAI's `gpt-4-vision-preview` model for this prototype.
I won't be using OpenAI for every prototype, in the future I expect to use Llama and Mistral as well.
There are two separate GPT-4 requests that I'll be making for this prototype.

### Request 1: Initial Creation

This is the request triggered by submitting the form on the landing page.
Please note the outputs are provided to GPT-4 as an OpenAPI spec for function_call'ing purposes.
As a result, you won't see the outputs requested explicitly in the template.

#### Inputs

* OpenAI API Key (Required)
* Component Name (Required)
* Component Mockup (Required)
* Language (Optional, defaults to Javascript)
* UI Component Library (Optional, defaults to HTML+React)
* Styling System (Optional, defaults to CSS)
* User Notes (Optional)

#### Outputs

* Props for Component as Typescript code
* Test Props for Component as a JSON Object
* Component Code

#### LLM Template
This is just my initial guess at what the template will look like. 
It will almost certainly change with experimentation and I'll share the final version.

```django
You are an AI-powered React component generator. 
Your goal is to provide well styled React components to help developers build UIs faster.

Please use the attached component mockup to generate a React component. 
You must pay close attention to the styling in the mockup and make sure to generate a component that matches the mockup.
When generated code make sure you use the following developer preferences:
* Component Name: [[ component_name ]]
* Language: [[ language ]]
* UI Component Library: [[ ui_component_library ]]
* Styling System: [[ styling_system ]]

[% if user_notes %]
Please use the following notes to help you generate the component:
[[ user_notes ]]
[% endif %]
```

### LLM Request 2: Component Update

This is the request triggered by updates once the user is in the editor view. 
Please note the outputs are provided to GPT-4 as an OpenAPI spec for function_call'ing purposes.
As a result, you won't see the outputs requested explicitly in the template.

#### Inputs
* OpenAI API Key (Required)
* Component Name (Required)
* Component Mockup (Required)
* Language (Optional, defaults to Javascript)
* UI Component Library (Optional, defaults to HTML+React)
* Styling System (Optional, defaults to CSS)
* User Notes (Optional)
* Props for Component in Typescript (Required, pulled from Initial Creation)

#### Outputs
* Component Code
* Test Props for Component as a JSON Object

#### LLM Template

```django
You are an AI-powered React component generator. 
Your goal is to provide well styled React components to help developers build UIs faster.

Please use the attached component mockup to generate a React component. 
You must pay close attention to the styling in the mockup and make sure to generate a component that matches the mockup.
When generated code make sure you use the following developer preferences:
* Component Name: [[ component_name ]]
* Language: [[ language ]]
* UI Component Library: [[ ui_component_library ]]
* Styling System: [[ styling_system ]]

Use the following props for the component:
[[ props ]]

[% if user_notes %]
Please use the following notes to help you generate the component:
[[ user_notes ]]
[% endif %]
```

## Tech Stack

I'm using a stack that I'm very familiar with. 
YMMV with these frameworks.
Use whatever gets the job done.

### Backend

* Python 3
* FastAPI
* SQLModel
* SQLAlchemy
* Postgres

### Frontend

* React
* Ant Design
* TanQuery

### Tools

* Github: CI/CD
* Agent (a 100x joint): LLM Observability and Fine-Tuning

## Prototype Timeline

* Specification: Jan 15th (Complete)
* Delivery: Jan 19th
