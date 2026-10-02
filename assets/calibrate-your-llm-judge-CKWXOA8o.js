const e=`An LLM judge turns a question, some retrieved context and an answer into a score. Relevance, correctness, hallucination. Those scores feed dashboards, regression tests and weekly reviews. Almost everything downstream treats them as measurements.

They are not measurements until someone checks them. A judge is a model with a prompt, and it can be wrong in steady, repeatable ways. A wrong judge is worse than no judge, because it produces confident numbers that point you at the wrong fix.

Several of my other notes say "spot-check the judge against human labels." This one explains how, and what published work says to expect.

## What you are measuring

You want to know how often the judge agrees with a person whose judgment you trust. That sounds like one number. It is at least three.

**Raw agreement.** The share of cases where judge and human give the same label. It is easy to compute and easy to fool. Hamel Husain gives the standard example in his [guide to LLM judges](https://hamel.dev/blog/posts/llm-judge/index.html): if only 5% of answers are bad, a judge that says "pass" every time agrees with the human 95% of the time and catches nothing. Hallucination is exactly this kind of metric. Most answers are fine, so a lazy judge looks accurate.

**True positive and true negative rates.** Husain's fix is to report two numbers. How many of the human-labeled failures did the judge catch? How many of the human-labeled passes did it correctly pass? A judge needs to be good at both. The first tells you whether you can trust it to find problems. The second tells you whether it will flood you with false alarms.

**Cohen's kappa.** This is agreement adjusted for the agreement you would get by chance. Zero means no better than chance, and one means perfect. Eugene Yan's [survey of LLM evaluators](https://eugeneyan.com/writing/llm-evaluators/) collects kappa values from several studies, and they vary a lot by task. On MT-Bench, human-human kappa was 0.81 and GPT-4 against humans was 0.85. On a TriviaQA grading task, human-human kappa was 0.97, while GPT-4 reached 0.84 and Llama-3-70B 0.79. On search relevance judgments, human-LLM kappa fell between 0.3 and 0.5, which is only fair agreement.

The pattern in those numbers is the useful part. Judges can match people on some tasks and fall well short on others. Relevance judging looks like the hard case, and relevance is the first thing a retrieval review scores. You cannot assume the good numbers apply to your task. You have to measure it.

## Build a small labeled set first

You do not need thousands of labeled examples. You need a few hundred good ones, labeled carefully.

Husain suggests starting with about 30 examples to discover how your assistant fails, then aiming for roughly 100 examples per failure mode when you validate, with a similar number of passes and failures. Yan reports the EvalGen workflow advising users to look at at least 20 examples before settling on criteria.

Three habits make the labels worth having.

**One accountable expert.** Husain recommends a single domain expert as the arbiter, not a committee. Scattered opinions give you a label set that disagrees with itself, and no judge can match that.

**Write down why.** Each label gets a short critique: what was right or wrong, and why. Husain says these should be detailed enough to use as few-shot examples in the judge prompt. They also make the labels reviewable later.

**Expect the criteria to move.** The ["Who Validates the Validators?"](https://arxiv.org/pdf/2404.12272) paper from Shankar and colleagues describes *criteria drift*. People need criteria to grade outputs, but grading outputs changes what they think the criteria are. So the first batch of labels will change your rubric. That is normal. Plan one revision, and re-label the early examples after it.

## Know the judge's usual mistakes

Published tests find the same few biases. The figures below come from the MT-Bench study, as summarized in Yan's survey.

- **Position bias.** When comparing two answers, judges favor one slot. Yan reports GPT-3.5 was biased about half the time and Claude-v1 about 70% of the time, toward the first position.
- **Verbosity bias.** Judges favor longer answers. Claude-v1 preferred the longer one more than 90% of the time in a test built to expose it.
- **Self-enhancement bias.** Judges favor text from their own model family. GPT-4 had a 10% higher win rate for its own answers and Claude-v1 25%.

Those tests are about comparing two answers, and many retrieval scores grade one answer at a time. So not every bias applies directly. But the lesson carries over. If your judge model also wrote the answers, or if it rewards long answers, check for that on purpose. Compare scores against answer length. Use a judge from a different model family than the generator where you can.

## Choose a scale, and test it

Published advice splits here, which is worth knowing.

Husain argues for binary pass or fail. His reasoning is that a binary choice forces everyone to decide what matters, and it makes the true positive and negative rates clean. Databricks, in its [best practices for RAG evaluation](https://databricks.com/blog/LLM-auto-eval-best-practices-RAG), prefers low-precision integer scales such as 0 to 3 over both binary and wide ranges like 0 to 100. They report that this kept human and judge rankings consistent and made the grades easier to explain. They also write out a rubric with an example for each score. With a GPT-4 judge they saw above 80% agreement with humans on correctness and readability, and above 95% when a one-point difference was allowed.

Both can be right for their setting. My own reading is to start binary for failure types like hallucination, where you want a clear alarm. Use a short integer scale where grades matter, such as relevance. Either way, write an example for each score. Then let your labeled set decide, because that is what it is for.

Databricks also found that comprehensiveness, the more subjective metric, had weaker agreement than correctness. The more subjective the metric, the less you should trust the judge without checking.

## Iterate on a dev set, then test on a held-out set

Treat the judge prompt like code under test.

1. Split the labeled set into a development half and a held-out half.
2. Run the judge on the development half. Read the disagreements one by one.
3. Edit the prompt, add examples from the disagreements, and rerun.
4. When it looks good, run once on the held-out half. That number is the one you report.

If you tune on every example, your agreement number will be optimistic. The held-out half keeps it honest. Husain's write-up describes a team reaching over 90% agreement in three rounds of this loop.

When agreement stays low, fix the rubric before you swap the model. A vague rubric will not improve with a bigger judge.

## Keep the calibration attached to the scores

A calibration done once and forgotten goes stale. The judge prompt changes. The model gets upgraded. The assistant starts answering a new kind of question.

So store the calibration with every run. For each scoring job, record the judge model, the prompt version, the date of the last calibration, and the true positive and negative rates from it. This is the same idea as the run metadata in [You can't review an eval you can't find](#/writing/retrieval-quality-review). A score without its judge version can't be compared to last month's. When the prompt changes, re-run the held-out check before trusting the new trend.

Also keep a few of the labeled examples as a permanent check. If a prompt edit changes how the judge scores them, you find out the same day.

## What it costs

**Expert time.** Labeling a few hundred examples carefully takes days, not hours, and it needs the person who knows the domain. This is the real cost. Spread it out and reuse the labels.

**Judge calls.** Each calibration run is a batch of model calls. It is small next to the daily scoring volume.

**An uncomfortable result.** You may find the judge is weaker than the dashboard implied. That is useful. It tells you which scores to stop quoting.

## Why it matters for retrieval

For a RAG system, a judge scores [retrieval separately from generation](#/writing/retrieval-vs-generation-failures). Relevance of retrieved chunks, correctness of the answer, and hallucination are different judgments. Each needs its own labels and its own agreement check. A judge that is good at correctness can be poor at relevance.

This matters most when you try something like [reranking](#/writing/rerank-before-you-generate). The way you decide it worked is a change in scores. If the judge is not calibrated, you cannot tell a real gain from judge noise.

## The test

Pick one metric your dashboard reports. Find the labeled examples that back it. Ask what the true positive and true negative rates are, and when they were last measured. If nobody can answer in a minute, the score is a guess with a number attached. Fix that before you act on the next drop.

The figures here come from each source's own experiments, as noted above. They show what is possible. Your judge, on your data, will differ.
`;export{e as default};
