An AI assistant that answers from a library of articles can fail in three ways at the search step. It can miss the right article. It can find an article that is hard to match because of how it is written. Or it can rank a weaker article above a better one. My work on a production assistant I evaluate deals with the last two. This note explains the two methods I use for them, how they differ, and how one of them differs from a published technique it is often confused with.

Internal system names, metric definitions, and numbers are left out on purpose.

## Method one: change the content before it is indexed

An assistant answers from a library of articles. If an article is vague, missing the wording people actually use, or out of line with current policy, no retrieval trick fully fixes it.

So part of the work is content transformation. Articles are rewritten or enriched using the organization's policy documents as the reference, so the wording matches what the policy says. Where the library has a gap, custom articles are curated to fill it. This changes the text that goes into the index.

Anthropic, the company that makes Claude, describes a related idea in [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval). Their problem is that a chunk cut out of a document loses its surroundings. A chunk that says "revenue grew by 3% over the previous quarter" does not say which company or which quarter. Their fix is a preprocessing step. A model writes a short context for each chunk, about 50 to 100 tokens. That context is prepended before the chunk is embedded and indexed for keyword search. They report the share of retrieval failures in the top 20 results. It fell from 5.7% to 3.7% with contextual embeddings. It fell to 2.9% with contextual keyword search added, and to 1.9% with reranking added. Those are Anthropic's numbers on their own test sets, so they show the technique works. They do not predict what it would do for another library.

The transformation I work with and theirs share the same idea: change what gets indexed so that matching gets easier. They differ in who decides. Their context is written by a model for every chunk. Ours is guided by policy documents and by people who curate the content.

## Method two: give better articles a small ranking boost

The second method does not change the text. It changes how candidates are ordered once they are retrieved.

Each article carries a content quality index, a score computed ahead of time from how well the article is built and how current it is. At retrieval time, the index is blended into the relevance score. When two articles match a question about equally well, the better-built and more current one now ranks higher.

This is **not** part of Contextual Retrieval. As far as I can tell from reading Anthropic's post, it describes no priority score and no boosting of selected documents. The two methods solve different problems. Contextual Retrieval fixes what the index can see. A quality index fixes how ties and near-ties are broken. In my view they also combine well, because the first improves candidate recall and the second helps order the candidates.

Boosting by a precomputed score is a standard feature of search engines. Elasticsearch, a widely used open-source search engine, has a [rank feature query](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-rank-feature-query) that adds the value of a numeric field, such as a popularity or quality score, to a document's relevance. Its default saturation function maps a value S to S / (S + pivot). This keeps the boost between 0 and 1, so a very high score cannot overwhelm relevance. Its [function score query](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-function-score-query) lets you choose how to combine the scores, by multiplying or adding. It also offers decay functions for dates, so newer content scores higher. I am not saying my system runs on Elasticsearch. These pages show the pattern is established and what the usual choices are.

## Design rules I follow

These are my own reasoning, not claims from the sources above.

1. **Bound the boost.** Relevance should decide most of the order. A saturating curve keeps the quality score from lifting an article that barely matches the question. A boost can reorder good candidates. It cannot rescue a bad one.
2. **Build the score from things you can inspect.** The one I use comes from structure and freshness. Anyone can look at an article and see why it scored the way it did. It deliberately does not use click or usage data, because boosting what already gets used can create a loop where popular articles stay popular.
3. **Decide what a missing score means.** Every article needs a value, even if it is a neutral default. Otherwise new or unscored content is quietly treated as either the best or the worst.
4. **Log the boost.** When a bad answer comes back, I want to see whether the quality score pushed the wrong article up. That means recording relevance and the quality contribution separately in the trace. See [How fast can you open the trace behind a bad answer?](#/writing/traces-people-can-reach).
5. **Test it with and without.** The boost is a ranking change, so it deserves a regression test. I compared results with and without it on a ground-truth set before relying on it, as described in [How to keep a test set useful after launch](#/writing/ground-truth-and-regression-tests). The numbers are internal, so I leave them out.

## What it costs

| Choice | What it gives up |
|---|---|
| Boosting by structure and freshness | A tidy, recent but wrong article can outrank an older correct one. The score measures form, not truth. |
| Precomputed score | It goes stale when content changes, so it needs recomputing on a schedule. |
| Blending into relevance | The weight is a judgment call, and a heavy weight hides relevance mistakes. |
| Content transformation by hand and by policy | It is slow and depends on curators. It does not scale like a model-generated context. |

## Where this sits next to reranking

A quality boost and a reranker both reorder candidates, but they work from different evidence. A reranker reads the question and the article together and judges fit. The quality index knows nothing about the question and only describes the article. I would not use one to replace the other. My [note on reranking](#/writing/rerank-before-you-generate) covers the reranker side, including why I would test it before adding an LLM-based one.
