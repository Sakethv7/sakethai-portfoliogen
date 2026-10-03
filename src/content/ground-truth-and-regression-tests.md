A prompt tweak makes one answer better. A week later, someone notices another answer got worse. Nobody can say when. By the tenth tweak, no one remembers which earlier behavior was traded away.

That is the problem a ground-truth set and regression tests solve. The set is a fixed collection of questions with known good outcomes. The regression test runs your system against it on every change and tells you what moved. Without them, quality is a feeling. With them, it is a number you can compare across weeks.

This note covers how to build the set and what goes in each item. It also covers how to run the set as a gate and how to stop it going stale. It builds on the [failure split](#/writing/retrieval-vs-generation-failures) and on [calibrating the judge](#/writing/calibrate-your-llm-judge). I use regression tests on a ground-truth benchmark for the production assistant described in the [case study](#/work/enterprise-ai-quality). The sources below are the published evidence I found on how to do this well.

## Two kinds of eval, one pipeline

Anthropic's [guide to agent evals](https://anthropic.com/engineering/demystifying-evals-for-ai-agents) separates two jobs that people often mix up.

A **capability eval** asks what the system can do well. It should start with a low pass rate, because it targets things the system still struggles with. A **regression eval** asks whether the system still handles everything it used to. It should sit near 100%. A drop means something broke.

The two are connected. Tasks that reach a high pass rate in a capability eval can graduate into the regression suite. So the set is not static. Hard cases enter as goals. They move into the guard rail once you solve them.

One side effect is worth knowing. An eval at 100% still catches regressions, but it gives no signal about improvement. If every score is pinned at the top, it is time to add harder cases.

## Where the examples come from

Start from real failures, not from invented questions.

Anthropic's advice is that 20 to 50 simple tasks drawn from real failures is a good start. The reason is that early changes have large effects and small samples are enough. Draw them from the manual checks you already run, and from your bug tracker and support queue. Langfuse's guide on [golden datasets](https://langfuse.com/resources/engineering/golden-dataset-evaluation) says the same. Use production traces as the primary source. Add a flagged trace while the failure is still fresh. For this system, a thumbs-down with its trace ID is the natural feed. It connects to the [trace plumbing](#/writing/traces-people-can-reach).

Hamel Husain's [evals FAQ](https://hamel.dev/blog/posts/evals-faq/) adds the step before that. Read about 100 real traces, write notes on what went wrong, group them into failure modes, and count them. That tells you what to test. He recommends real traces over synthetic data, and notes that synthetic data cannot tell you how common a problem is in real use.

### What synthetic questions miss

Generating questions from your documents is fast, and it helps fill coverage gaps. It also drifts from reality. A 2026 study, [Beyond Benchmark Scores](https://arxiv.org/abs/2609.14579), compared 1,851 synthetic questions with 322 real ones for a university information system. Synthetic queries averaged 15.7 words and real ones 6.8. Synthetic questions touched 165 distinct source documents, while real ones touched only 53. Setups that looked strong on the synthetic set dropped on the real queries. This is one system, so treat it as an example of the gap and not a universal rate.

The practical rule: use synthetic questions to cover what you haven't seen, and review them as carefully as real ones. Don't use them as your only measure of how the system does on real traffic.

## What one item holds

A bare question and answer is not enough. For a RAG system, each item should carry:

| Field | Purpose |
|---|---|
| Question | Written the way real users write it, often short and vague |
| Expected answer or criteria | A literal answer, a reference response, or a short list of things the answer must contain |
| Expected source document(s) | The document that should be retrieved |
| Failure-mode tag | Retrieval, ranking, generation, knowledge gap |
| Source and date added | Where it came from, and how old it is |
| Reviewer | Who approved it |

The expected source document is my addition to what the sources say, and it matters for this kind of system. It lets you check retrieval without a judge. Did the right document appear in the top k? That check is plain code. It gives the same answer every time, and it is the first thing to put in a gate. It is also what lets you [score retrieval separately from generation](#/writing/retrieval-vs-generation-failures), and later measure whether [reranking](#/writing/rerank-before-you-generate) moved the right chunk up.

Two quality rules from Anthropic apply here. A task should be clear enough that two domain experts would reach the same verdict on their own. And each task benefits from a reference solution, a known good output that passes every grader. That proves the task can be solved and that the grader is set up correctly.

Also keep the set balanced. Test cases where a behavior should happen and cases where it should not. A set made only of easy, positive cases tells you almost nothing. Langfuse puts it bluntly: it will score 95% forever.

## How big

The sources give working ranges, not one answer.

- **To start:** 20 to 50 items, per Anthropic.
- **A repeatable set:** 100 or more examples covering important workflows and confirmed failures, per Husain.
- **A pull-request gate:** tens to low hundreds of items, per Langfuse's guide on [regression testing](https://langfuse.com/resources/engineering/llm-regression-testing). Below about 20, a single output moves the average too much.
- **Nightly or release runs:** larger sets, up to 1,000 items, so the fast gate stays fast.

So you can use two tiers: a small, fast set on every change, and a larger one on a schedule.

## Running it as a regression test

Langfuse describes three parts. The first is the dataset. The second is an experiment that runs your application on every item and scores it. The third is a threshold check that fails the run if the score drops below it.

Four design choices matter.

**Gate on aggregates, not single items.** Averaging across the whole set dampens noise. Set the threshold with a margin below your baseline. Their example is 0.8 against a baseline of 0.88, so ordinary variance doesn't fail the build.

**Block on code checks. Warn on the judge.** Deterministic checks make reliable gates. Langfuse suggests treating judge-based metrics as warnings at first. This is where [judge calibration](#/writing/calibrate-your-llm-judge) matters. Pin the judge model version and use a binary rubric with explicit criteria to reduce variability.

**Show which items broke.** A fail with no detail is not useful. The comparison view should list the specific questions that changed, so you can read them.

**Record the dataset version with every run.** Without it, you can't tell a real drop from a changed set. Langfuse versions datasets by timestamp and stores the version with each experiment, so you can rerun any past comparison exactly.

Husain also draws a line between uses. In continuous integration, evals gate code changes. In production, the same ideas track ongoing health and drift. They are related but not the same job.

## Keep the set alive

Langfuse's guide makes a sharp point: freshness is the property that decays silently. Documents change. Products change. A set that was right in March can be quietly wrong by autumn.

Four habits slow the decay.

- **Keep feeding it.** Route new production failures into the set while they are fresh.
- **Remove near-duplicates.** Several phrasings of one question overweight it.
- **Date every item.** You can then see staleness at a glance.
- **Retire, don't delete.** Archive items for dropped features or wrong references. Review anything older than about six months on a regular schedule.

Anthropic says to treat eval maintenance as routine, like maintaining unit tests, with a clear owner. Husain suggests re-running error analysis after major changes and checking 10 to 20 traces each week. This pairs with the [weekly review](#/writing/retrieval-quality-review): the review finds the new failures, and the set is where they go to stay fixed.

## Read the transcripts

A passing score proves little if the grader is wrong. Anthropic says they don't take eval scores at face value until someone has read the details and some transcripts. Do this on a sample of both passes and failures. It catches broken graders, ambiguous tasks and answers that pass for the wrong reason.

## One trap: overfitting

If you tune your prompt against the same items every time, the score rises without the system getting better. It learns your test. Keep part of the set out of the tuning loop. Look at it only for the final check, as in judge calibration. Add fresh real failures regularly, so the set keeps changing.

## What it costs

**Curation time.** Someone has to review and label items. This is the main cost, and it is why a small, careful set beats a large, messy one.

**Run cost.** Each run is a batch of model calls plus judge calls. Keep the per-change set small and the big set scheduled.

**Maintenance.** The set needs an owner and a calendar. A set nobody maintains turns into false confidence.

## The test

Pick the last change you shipped. Ask whether you can show which questions got better and which got worse. The check must use a fixed set and a recorded baseline, and take under a few minutes. If you can, you have regression testing. If you can only say it felt better, start with 20 real failures and a single threshold.
