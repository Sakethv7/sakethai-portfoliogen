# Who should write a coding agent's memory?

*Research note · Agent evaluation · Claude Code, Claude Haiku*

Code, design docs and the full write-up: [github.com/Sakethv7/goal-contract-experiment](https://github.com/Sakethv7/goal-contract-experiment).

## The result

A coding agent forgets the task when its chat history is cut. A memory file brings the task back. I wanted to know which kind of memory keeps the agent on track as the owner keeps changing the goal.

In the final test, the owner gave the agent 1, 3 or 6 decisions over several sessions, with one small task in each session. The decisions shipped together on a later "release day", so only memory could carry them there.

| Memory | 1 decision | 3 decisions | 6 decisions |
| --- | --- | --- | --- |
| None | 0.00 | 0.00 | 0.00 |
| A log the system writes from the owner's own words | 1.00 | 1.00 | 1.00 |
| A notes file the agent writes itself | 0.25 | 0.25 | 0.19 |
| A goal tree with live checks, plus the same log | 1.00 | 1.00 | 1.00 |

Each value is the share of changed rules in the right state at the end. There were 81 valid runs, and the batch cost $7.38.

![Decision score by number of decisions, one line per memory type](goal-contract/sweep.svg)

The notes failed for a simple reason. In 17 of 24 runs the agent never wrote a decision down. On release day it searched the repo, found nothing and changed nothing. When it did write a decision, the decision stayed: I saw no case where the agent erased its own notes.

So in this test, who wrote the memory mattered more than its format. Memory that the system recorded from the human's instructions worked every time. Memory that depended on the agent choosing to write it did not.

## What I tested, and in what order

The project grew from one question: does a goal file keep a coding agent on task? I ran twelve small, scripted tests on a Python command-line tool, in four lines of questions.

1. **Scope.** A stop hook that blocked unplanned file edits cut stray edits from 5 of 10 runs to 0 of 10.
2. **Lost chat history.** With any memory file, the agent finished the task. With none, it forgot the task. This held on a real repo of mine, scored by that repo's own tests.
3. **Long sessions.** Rules from the first prompt survived 2 and 3 automatic context summaries. In 1 of 2 runs they were lost at 4.
4. **Goal changes.** Early versions were flawed. In one, the code itself carried the change, so even no memory passed. In another, an ambiguous prompt made agents wait. A clean version showed plain notes and the goal tree both at 8 of 8.

Most of these tests ended at a ceiling: every memory type scored the top mark, so none could beat another. The final test, S9, fixed that. It ran three difficulty levels in one batch, so the memory types had room to separate.

## How the final test worked

Every run started from the same finished code, so no run failed for reasons unrelated to memory. Each session held one owner decision and one small task. Two later decisions replaced earlier ones, so an agent that applied the older version was wrong.

At the end, hidden tests scored each changed rule. A short multiple-choice quiz then asked the agent which rule was in force. That split a wrong answer into two cases: the agent did not know the rule, or it knew and did not apply it. Four more tests checked that nearby code did not change.

I ran one pilot run per memory type first, fixed the pass and fail lines, and only then ran the main batch. The pilot changed nothing in the design.

## What did not happen

I expected two failure modes and saw neither.

- **Erasure.** Notes did not lose decisions they had already recorded.
- **Drift.** New decisions did not spill into nearby code or break unrelated rules. No wrong rule was a case of "knew it but did not apply it". Every rule the agent got wrong, it also got wrong in the quiz.

The goal tree scored the same as the plain log and cost up to 1.39 times as much per run as the notes. Structure added nothing that the log did not already give.

## Limits

- One model (Claude Haiku), one small task family, and 8 runs per memory type at each level. Read this as a pilot, not proof.
- The notes arm got no reminder in its prompts. Only the notes file itself said to keep it current, and the agent had to choose to open it. A reminder may close much of the gap. That is the next test.
- In an earlier test with one change and no extra task, plain notes worked in 8 of 8 runs. My reading is that the per-session task pulled the agent away from its notes. I have not tested that reading.
- I wrote the tasks, the rules and the hidden tests, so I may have tuned the difficulty without meaning to.

## What I would use

Do not rely on an agent to write its own memory. Have the system record the human's instructions, for example with a hook that logs each prompt and shows the log at the start of every session. If you use a notes file, remind the agent to update it in each prompt, and check that it does.
