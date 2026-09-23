When a RAG system gives a wrong answer, the usual response is to look at the answer. Was it relevant? Was it faithful? Did it hallucinate? Then everything gets rolled into one score.

That score hides the most useful fact: **where** the answer went wrong. A RAG answer is built in two steps. First the system retrieves context. Then a model writes an answer from it. Either step can fail, and the fixes have almost nothing in common. If you only measure the end result, you can't tell which step to fix.

## Two questions instead of one

For each evaluation query, ask two questions and score them separately:

1. **Did retrieval find what was needed?** Look only at the retrieved chunks. Is the information required to answer the question actually in there?
2. **Given that context, is the answer right?** Look at the answer against the retrieved context and the expected answer. Is it correct, and does it stay faithful to the context?

Put the two together and every query lands in one of four cells:

| | Answer good | Answer bad |
|---|---|---|
| **Context good** | Working as intended | **Generation failure** |
| **Context bad** | Suspicious pass | **Retrieval failure** |

Each cell points somewhere different.

**Generation failure: the context had it, the answer didn't.** The model ignored, misread, or contradicted what it was given. Look at the prompt, the model, how much context you pass in, and whether the instructions tell the model to stick to its sources.

**Retrieval failure: the context never had it.** No prompt change will fix this. Look at chunking, embeddings, the index, query rewriting, and ranking. Also check freshness: the right document may exist but not be indexed yet.

**Suspicious pass: bad context, good answer.** This one is easy to miss because the score looks fine. The model answered from what it already knew, not from your documents. That works until the question is about something internal or recent. Count these separately. A rising number means your system is leaning on luck.

## The third failure: nothing to retrieve

Some questions have no answer in the corpus at all. Retrieval returns its best guess, which is wrong, and the query shows up as a retrieval failure. But tuning the retriever won't help, because the document doesn't exist.

These are **knowledge gaps**, and they belong to whoever owns the content, not to the engineers. It's worth labeling them on their own. They can be a large share of failures, and they're the easiest to act on: write the missing document.

## Making it work in practice

**Keep a small ground-truth set.** For each query, store the expected answer and, where you can, which document should have been retrieved. A few hundred good examples beat thousands of vague ones.

**Use an LLM judge, but check the judge.** Judging retrieval relevance and answer faithfulness by hand doesn't scale, so an LLM judge usually does it. Before trusting its labels, compare them against a sample you've labeled by hand. If they disagree often, fix the judge's instructions first.

**Track it over time.** A single run tells you where things stand today. Tracking the four cells across runs tells you whether a prompt or index change made things better or just moved failures from one cell to another.

**Put cheap checks first.** Not every query needs a model to classify it. Rules can handle the obvious cases, and the LLM judge only needs to see what's left.

## Why it matters

The payoff is that a bad number stops being a mystery. "Answer quality dropped 5%" leads to a meeting. "Retrieval failures doubled after Tuesday's re-index" leads to a fix.

This note grew out of evaluating a production RAG assistant used by roughly 140,000 people, where separating failure modes turned out to be the most useful part of the work. The case study covers how that breakdown was built: [Measuring an enterprise RAG assistant](#/work/enterprise-ai-quality).

