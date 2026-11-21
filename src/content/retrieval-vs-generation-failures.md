A RAG system answers a question in two steps. First it searches a document store and retrieves the passages that look relevant. Then a model writes an answer from those passages. When the answer is wrong, teams usually grade only the final answer and combine everything into one score.

One score cannot show **which** step failed. The search can miss the right passage, or the model can misuse a passage it got. The fixes for these two problems are very different. So I score the two steps separately.

## Two questions instead of one

For each evaluation query, ask two questions and score them separately:

1. **Did retrieval find what was needed?** Look only at the retrieved chunks. Is the information required to answer the question actually in there?
2. **Given that context, is the answer right?** Look at the answer against the retrieved context and the expected answer. Is it correct, and does it stay faithful to the context?

Put the two together and every query lands in one of four cells:

| | Answer good | Answer bad |
|---|---|---|
| **Context good** | Working as intended | **Generation failure** |
| **Context bad** | Suspicious pass | **Retrieval failure** |

<figure class="diagram">
<a href="diagrams/retrieval-vs-generation.svg" target="_blank" rel="noopener"><img src="diagrams/retrieval-vs-generation.svg" width="900" height="700" alt="A grid of two questions. Good context with a good answer works. Good context with a bad answer is a generation failure. Bad context with a good answer is a suspicious pass. Bad context with a bad answer is a retrieval failure, or a knowledge gap when the document does not exist."></a>
<figcaption>Read across for the answer, down for the context. Each failing cell names where to look.</figcaption>
</figure>

Each cell points somewhere different.

**Generation failure: the context had it, the answer didn't.** The model ignored, misread, or contradicted what it was given. Look at the prompt, the model, how much context you pass in, and whether the instructions tell the model to stick to its sources.

**Retrieval failure: the context never had it.** No prompt change will fix this. Look at chunking, embeddings, the index, query rewriting, and ranking. Also check freshness: the right document may exist but not be indexed yet.

**Suspicious pass: bad context, good answer.** People often miss this case because the score looks fine. The model answered from what it already knew, not from your documents. That stops working when the question is about something internal or recent. Count these separately. If the count goes up, the system depends more on luck.

## The third failure: nothing to retrieve

Some questions have no answer in the corpus at all. Retrieval returns its best guess, which is wrong, and the query shows up as a retrieval failure. But tuning the retriever won't help, because the document doesn't exist.

These are **knowledge gaps**, and they belong to whoever owns the content, not to the engineers. I label them on their own. They can be a large share of failures, and they're the easiest to act on: write the missing document.

## Making it work in practice

**Keep a small ground-truth set.** For each query, store the expected answer and, where you can, which document should have been retrieved. In my experience, a few hundred careful examples are more useful than thousands of vague ones.

**Use an LLM judge, but check the judge.** Judging retrieval relevance and answer faithfulness by hand doesn't scale, so an LLM judge usually does it. Before trusting its labels, compare them against a sample you've labeled by hand. If they disagree often, fix the judge's instructions first.

**Track it over time.** A single run tells you where things stand today. Track the four cells across runs. This tells you whether a prompt or index change made things better or just moved failures from one cell to another.

**Put cheap checks first.** Not every query needs a model to classify it. Rules can handle the obvious cases, and the LLM judge only needs to see what's left.

## What this gives you

A bad number now points to a step. "Answer quality dropped 5%" does not say what to do. "Retrieval failures doubled after Tuesday's re-index" says where to look.

This note comes from my work evaluating a production RAG assistant used by roughly 140,000 people. There, separating the failure types was the most useful part of the work. The case study covers how that breakdown was built: [Measuring an enterprise RAG assistant](#/experience/enterprise-ai-quality).

