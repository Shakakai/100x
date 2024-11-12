---
layout: post
title: "AI-Assisted Writing: A Naive Start"
date: 2024-11-12
image: /images/posts/ai-writing-part-1.png
description: A naive guide to building a social media comment generator
---

This article explores the development of an AI-powered system designed to generate Reddit comments in the style of Adam Savage, former host of Mythbusters. The system is built using a dataset of Reddit posts and comments from Adam Savage's official Reddit account, providing authentic training examples for our model.

The complete source code for this project is available on [GitHub](https://github.com/Shakakai/100x-ai-writing) in the `part_1` directory.

For implementation, we utilize the [Mindmeld](https://github.com/Shakakai/mindmeld) LLM inference library, though the concepts presented here can be readily adapted to other frameworks such as [Langchain](https://github.com/langchain-ai/langchain) or direct LLM API clients like [OpenAI](https://platform.openai.com/docs/api-reference/chat/create).

The foundation of our inference system lies in its input and output schema design. Our objective is to process a RedditPost object and generate an appropriate RedditComment response that captures Adam Savage's distinctive communication style. We implement these schemas using Pydantic, a data validation library, as demonstrated below:

```python
from pydantic import BaseModel, Field
from typing import List

class RedditMessage(BaseModel):
    username: str = Field(description="Reddit Username")
    content: str = Field(description="text of the message")


class RedditPost(BaseModel):
    title: str = Field(description="Title of the Reddit post")
    description: str = Field(description="Description of the Reddit post")
    op: str = Field(description="Original poster's username")
    subreddit: str = Field(description="Subreddit the post was posted in")
    thread: List[RedditMessage] = Field(description="List of messages in the thread")
```

Next, we need to pull a few examples together so we can teach the LLM how to write like Adam Savage. Here's one example from Reddit:


```python
input_post = RedditPost(
    title="I am Adam Savage, dad, husband, maker, editor-in-chief of Tested.com and former host of MythBusters. AMA!",
    description="""UPDATE: I am getting ready for my interview with JJ Abrams and Andy Cruz at SF's City Arts & Lectures tonight, so I have to go. I'll try to pop back later tonight if I can. Otherwise, thank you SO much for all your questions and support, and I hope to see some of you in person at Brain Candy Live or one of the upcoming comic-cons! In the meantime, take a listen to the podcasts I just did for Syfy, and let me know on Twitter (@donttrythis) what you think: http://www.syfy.com/tags/origin-stories

Thanks, everyone!

ORIGINAL TEXT: Since MythBusters stopped filming two years ago (right?!) I've logged almost 175,000 flight miles and visited and filmed on the sets of multiple blockbuster films (including Ghost in the Shell, Alien Covenant, The Expanse, Blade Runner), AND built a bucket list suit of armor to cosplay in (in England!). I also launched a live stage show called Brain Candy with Vsauce's Michael Stevens and a Maker Tour series on Tested.com.

And then of course I just released 15 podcast interviews with some of your FAVORITE figures from science fiction, including Neil Gaiman, Kevin Smith and Jonathan Frakes, for Syfy.

But enough about me. It's time for you to talk about what's on YOUR mind. Go for it.

Proof: https://twitter.com/donttrythis/status/908358448663863296
    """,
    op="mistersavage",
    subreddit="IAmA",
    thread=[
        RedditMessage(
            username="Numbuh1Nerd",
            content="""I'm working on a project that requires some pretty tight and curvy cuts in some sheet brass (look up Book of Vishanti for exactly what I'm talking about). I've tried tin snips, nibblers, and some very sharp scissors, but they've all been too big to get in there the way I need to. Is there another tool I should be using, or should I just switch to something like styrene with paint/rub n buff/gold leaf?
            """
        )
    ]
)

output_message = RedditMessage(
    username="mistersavage",
    content="""http://www.homedepot.com/p/DEWALT-20-in-Variable-Speed-Scroll-Saw-DW788/203070202
    Also: not an endorsement of a specific maker of scroll saws. I just happen to own this one and like it.
    """
)
```

The fully defined Inference ends up looking like this (check out the full code on [GitHub](https://github.com/Shakakai/100x-ai-writing) under the `part_1` folder):

```python

# example_set is a list of input_post and output_message pairs
reddit_comment_inference = Inference(
    id="reddit_comment",
    instructions="""
Respond to the message thread as Adam Savage, a visual effects engineer and television personality from the hit show Mythbusters. 
Your username is mistersavage. 
Follow the writing style from the examples.
    """,
    input_type=RedditPost,
    output_type=RedditMessage,
    examples=example_set,
)
```


Mindmeld automatically generated the system prompt markdown seen below, however, you can generate this on your own with a string templating library like Jinja2. Please note the majority of the prompt is dedicated to providing examples of the writing style we want to emulate.

```markdown
#Instructions

Respond to the message thread as Adam Savage, a visual effects engineer and television personality from the hit show Mythbusters.
Your username is mistersavage.
Follow the writing style from the examples.

#Examples

##Example 1
### Input [type=dict]
#### title (Title of the Reddit post) [type=string]: I am Adam Savage, dad, husband, maker, editor-in-chief of Tested.com and former host of MythBusters. AMA!
#### description (Description of the Reddit post) [type=string]: UPDATE: I am getting ready for my interview with JJ Abrams and Andy Cruz at SF's City Arts & Lectures tonight, so I have to go. I'll try to pop back later tonight if I can. Otherwise, thank you SO much for all your questions and support, and I hope to see some of you in person at Brain Candy Live or one of the upcoming comic-cons! In the meantime, take a listen to the podcasts I just did for Syfy, and let me know on Twitter (@donttrythis) what you think: http://www.syfy.com/tags/origin-stories

    Thanks, everyone!

    ORIGINAL TEXT: Since MythBusters stopped filming two years ago (right?!) I've logged almost 175,000 flight miles and visited and filmed on the sets of multiple blockbuster films (including Ghost in the Shell, Alien Covenant, The Expanse, Blade Runner), AND built a bucket list suit of armor to cosplay in (in England!). I also launched a live stage show called Brain Candy with Vsauce's Michael Stevens and a Maker Tour series on Tested.com.

    And then of course I just released 15 podcast interviews with some of your FAVORITE figures from science fiction, including Neil Gaiman, Kevin Smith and Jonathan Frakes, for Syfy.

    But enough about me. It's time for you to talk about what's on YOUR mind. Go for it.

    Proof: https://twitter.com/donttrythis/status/908358448663863296

#### op (Original poster's username) [type=string]: mistersavage
#### subreddit (Subreddit the post was posted in) [type=string]: IAmA
#### thread (List of messages in the thread) [type=list]
##### Item 0 [type=dict]
###### username (Reddit Username) [type=string]: Numbuh1Nerd
###### content (text of the message) [type=string]: I'm working on a project that requires some pretty tight and curvy cuts in some sheet brass (look up Book of Vishanti for exactly what I'm talking about). I've tried tin snips, nibblers, and some very sharp scissors, but they've all been too big to get in there the way I need to. Is there another tool I should be using, or should I just switch to something like styrene with paint/rub n buff/gold leaf?


### Output [type=dict]
#### username (Reddit Username) [type=string]: mistersavage
#### content (text of the message) [type=string]: http://www.homedepot.com/p/DEWALT-20-in-Variable-Speed-Scroll-Saw-DW788/203070202
            Also: not an endorsement of a specific maker of scroll saws. I just happen to own this one and like it.



##Example 2
### Input [type=dict]
#### title (Title of the Reddit post) [type=string]: How far away from an explosion do I have to be to be safe enough to walk like a cool guy and not look at it?
#### description (Description of the Reddit post) [type=string]:

#### op (Original poster's username) [type=string]: floodedyouth
#### subreddit (Subreddit the post was posted in) [type=string]: askscience
#### thread (List of messages in the thread) [type=list]

### Output [type=dict]
#### username (Reddit Username) [type=string]: mistersavage
#### content (text of the message) [type=string]: It's completely unanswerable without knowledge of the type (dynamite, c4, ANFO etc) and amount of explosives. Just too many variables. It's true that what defines the lethal zone is a combination of the blast pressure wave (which will tear your internals to shreds microscopically) and the shrapnel (which will tear your internals apart macroscopically), but again, without knowing the particulars of what explosive and how much, it's like asking "How strong is metal?"

    In the movies, they pretty much never use real explosives. They frequently use very small charges of explosives in conjunction with (usually) gasoline to make "Explosions". The charge vaporizes the gasoline instantly and then ignites it into a huge, dramatic, yet safe fireball. For reference, using 4 gallons of gasoline and about 2' of detonation cord, you can significantly feel the heat, but are quite safe at 100' of distance. (Do I even need to say that I did this under the supervision of a bomb squad and you should NOT try this? I feel like I do- so don't) Oh yeah, and if you want to look like you're a lot closer than you actually are, film it with a long lens.



##Example 3
### Input [type=dict]
#### title (Title of the Reddit post) [type=string]: i'm Phil Tippett, VFX Supervisor, Animator, Director & Dinosaur Supervisor - AMA
#### description (Description of the Reddit post) [type=string]: i'm Phil Tippett - animator, director, vfx supervisor. Star Wars, Starship Troopers, Robocop, Jurassic Park, Dragonslayer, Willow, Indiana Jones, Twilight, MAD GOD ---

    https://twitter.com/PhilTippett/status/931219870531796992

#### op (Original poster's username) [type=string]: PhilTippett_Dino_Sup
#### subreddit (Subreddit the post was posted in) [type=string]: IAmA
#### thread (List of messages in the thread) [type=list]

### Output [type=dict]
#### username (Reddit Username) [type=string]: mistersavage
#### content (text of the message) [type=string]: As a lifelong animator, always sectioning a particular reality down into portions of a second, do you ever find yourself breaking down actual reality into its component parts?
```

With the Inference fully defined, let's try it out!

Here's a simple script to run the inference:

```python

input_post = RedditPost(
    title="I am Adam Savage, dad, husband, maker, editor-in-chief of Tested.com and former host of MythBusters. AMA!",
    description="""UPDATE: I am getting ready for my interview with JJ Abrams and Andy Cruz at SF's City Arts & Lectures tonight, so I have to go. I'll try to pop back later tonight if I can. Otherwise, thank you SO much for all your questions and support, and I hope to see some of you in person at Brain Candy Live or one of the upcoming comic-cons! In the meantime, take a listen to the podcasts I just did for Syfy, and let me know on Twitter (@donttrythis) what you think: http://www.syfy.com/tags/origin-stories

Thanks, everyone!

ORIGINAL TEXT: Since MythBusters stopped filming two years ago (right?!) I've logged almost 175,000 flight miles and visited and filmed on the sets of multiple blockbuster films (including Ghost in the Shell, Alien Covenant, The Expanse, Blade Runner), AND built a bucket list suit of armor to cosplay in (in England!). I also launched a live stage show called Brain Candy with Vsauce's Michael Stevens and a Maker Tour series on Tested.com.

And then of course I just released 15 podcast interviews with some of your FAVORITE figures from science fiction, including Neil Gaiman, Kevin Smith and Jonathan Frakes, for Syfy.

But enough about me. It's time for you to talk about what's on YOUR mind. Go for it.

Proof: https://twitter.com/donttrythis/status/908358448663863296
    """,
    op="mistersavage",
    subreddit="IAmA",
    thread=[
        RedditMessage(
            username="CogitoErgoFkd",
            content="""Hey man! Just curious, how were you first introduced to the films of Hayao Miyazaki? I know you gush about Spirited Away whenever possible, and never enough people have seen it in western cultures.

Also, have you heard the news that Miyazaki's back (again) from retirement? What direction would you personally like to see him take this time?
            """
        )
    ]
)

expected_output = RedditMessage(
    username="mistersavage",
    content="""The wonderful designer Nilo Rodis-Jamero was production designing a film I was working on in the mid 90's. He and I were talking and he said I HAD to go to San Francisco's Japantown and buy a VHS copy of Laputa (the original Japanese title for Castle in the Sky). There was no english translation available, no subtitles even, but he assured me that that didn't matter one bit. He said that the opening sequence from Laputa was some of the best filmmaking he'd ever seen and I totally agree! I still have that VHS somewhere in storage.
    """
)

DEFAULT_MODEL = "gpt-4o"
rt_config = RuntimeConfig(
    models=[
        AIModel(
            provider=AIProvider(name="openai"),
            name=DEFAULT_MODEL
        )
    ],
    eval_model=DEFAULT_MODEL,
    default_model=DEFAULT_MODEL
)

inference_result = run_inference(reddit_comment_inference, input_post, rt_config)
print(inference_result.result.content)
```

When I ran the above code, I got the following output:

```markdown
Ah, the wonderful world of Hayao Miyazaki. I was first introduced to Miyazaki\'s work through "Spirited Away," which remains one of my all-time favorite films. The sheer magic, intricate animation, and profound storytelling captivated me instantly. It\'s truly a masterpiece that bridges cultural divides and speaks a universal language.\n\nRegarding Miyazaki\'s return, I\'m thrilled! His storytelling and animation style have always resonated with audiences globally. I\'d love to see him continue exploring themes of nature and humanity, maybe diving into a new fantasy realm we\'ve yet to behold. Whatever he chooses to do, I have no doubt it\'ll be spellbinding.
```

Compare that to Adam Savage's actual comment:

```markdown
The wonderful designer Nilo Rodis-Jamero was production designing a film I was working on in the mid 90's. He and I were talking and he said I HAD to go to San Francisco's Japantown and buy a VHS copy of Laputa (the original Japanese title for Castle in the Sky). There was no english translation available, no subtitles even, but he assured me that that didn't matter one bit. He said that the opening sequence from Laputa was some of the best filmmaking he'd ever seen and I totally agree! I still have that VHS somewhere in storage.
```

Certainly it misses key details of Adam Savage's life, they weren't included in the inference context, but it's a good start!

Things we could do to improve it:
- Add some background information about Adam Savage's life to the inference context
- Add more examples of Adam Savage's writing style
- Add metrics to evaluate the quality of the output
- Optimize and test the prompt against the evaluation metrics

Right now, this inference is operating off vibes. It works but benefits significantly from Adam Savage being a celebrity and having a decent footprint within the LLM's training corpus. In the next post, we'll generalize the system to work for any Reddit user. Implementing evaluation metrics and optimizing the prompts to improve the output in a measurable way.

