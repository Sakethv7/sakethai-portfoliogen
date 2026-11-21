# When do mini-batch updates beat Lloyd's k-means?

*Applied research · Experimental AI engineering · Apple M4 CPU*

## The result

Clustering groups similar items, such as similar images, so a large search system can find matches faster. The standard method, Lloyd's k-means, reads the whole dataset on every pass. A 2026 paper proposed a variant called e-means that updates from small batches instead, and reported that it reaches the same quality faster. I tried to reproduce its speed claim on my own laptop.

I tested whether e-means, a mini-batch alternative to Lloyd's k-means, could
reach the same held-out clustering error with fewer data passes and less wall
time on a 16 GB Apple M4 laptop.

Across 10 paired seeds on 100,000 real image embeddings, e-means reached the
held-out error of Lloyd after 25 epochs at its fourth epoch every time. Median
time to that quality was **2.55 times faster**. A paired-seed bootstrap interval
for that median was **2.52 to 2.57 times**.

After five epochs, e-means' median held-out error was **0.333% lower** than
Lloyd's 25-epoch result.

![Held-out clustering error against uninterrupted training time](e-means/quality-by-time.png)

The result is narrow. It applies to Deep1B 100k, 96 dimensions, 512 centroids,
Faiss 1.16.0, eight CPU threads and this Apple M4 machine. It is not a general
CPU claim and does not reproduce the paper's H100 results.

## Why clustering matters

An embedding model turns an image, document or other object into a vector. A
large system may hold millions of these vectors. Clustering replaces that
unstructured cloud with a smaller set of representative vectors called
centroids.

```text
100,000 image embeddings
          |
          v
   clustering algorithm
          |
          +--> 512 representative centroids
          +--> one cluster ID per image
          +--> distance from each image to its centroid
```

Those outputs can help partition a vector index, compress vectors, summarize
an unlabeled dataset or identify points far from every centroid. This experiment
measured representation error and computation time. It did not measure search
recall, product usefulness or whether the clusters match human categories.

## The comparison

Lloyd's k-means assigns the full dataset to centroids before updating them.
E-means updates centroid state through mini-batches using exponential moving
statistics. The paper reports that e-means reaches Lloyd's converged loss in
fewer passes on large embedding datasets.

I used 100,000 Deep1B image embeddings for training and held out another 10,000
for evaluation. The vectors have 96 dimensions. Both algorithms trained 512
centroids.

For every seed, both algorithms received the same training data, held-out data,
starting-centroid bytes, float32 representation, eight-thread setting and exact
nearest-centroid scorer. The target was that seed's Lloyd held-out mean squared
error after 25 epochs.

![Held-out clustering error against complete data passes](e-means/quality-by-epoch.png)

The statistical unit was a paired seed, not one of the 110,000 vectors. The
campaign contained 20 completed runs: two algorithms across 10 seeds. There
were no failed or invalid V5 runs, and every pair's initialization hash matched.

## The timing bug that changed the experiment

My first harness exposed Lloyd's held-out error after every epoch by rebuilding
a one-iteration Faiss clustering wrapper 25 times. A direct test compared that
trajectory with Faiss's normal uninterrupted 25-iteration call.

Both paths produced the same final held-out error. The checkpointed path took
0.929 seconds, while the uninterrupted call took 0.864 seconds. My
instrumentation made Lloyd look about 7.5% slower.

I replaced the design instead of keeping the larger speedup:

```text
trajectory execution                 timing execution
--------------------                 ----------------
pause after each epoch               run without scoring pauses
measure held-out error               measure training wall time
build the quality curve              build the timing curve
             \                         /
              final MSE must agree
```

Each algorithm now uses both paths. A run fails if their final held-out MSE
differs by more than 0.0000001. Analysis also rejects incomplete campaigns,
mixed source hashes, plan drift or unpaired initialization.

Five campaign versions record the correction trail. V1 used the inflated Lloyd
timing. V2 separated the paths but plotted the wrong time coordinates. V3 fixed
that graph, but a later source-formatting change broke its provenance match. V4
exposed a mislabeled per-seed field. Only V5 supports the published result.

## Where e-means did not reliably win

I also generated small distributions with known structure. They were diagnostic
tests, not a second speed benchmark.

- On clearly separated balanced groups, both methods reached effectively the
  same solution.
- On imbalanced overlapping groups, e-means crossed Lloyd's target in only
  three of five seeds. One seed ended materially worse.
- When I requested more centroids than natural groups, e-means crossed in four
  of five seeds and sometimes revived underused centroids.

These counterexamples stop the Deep1B result from becoming “e-means always
wins.” Centroid revival occurred in the main campaign, but this experiment did
not isolate whether revival caused the speedup.

## What is original here

I did not invent e-means or change its update rule. The contribution is the
independent empirical and measurement work around it:

- a paired Apple M4 result showing that the epoch advantage survived as a
  wall-time advantage on this configuration;
- a measurement design connecting checkpoint quality to uninterrupted timing
  through a numerical equivalence gate;
- a direct measurement of the bias introduced by the first harness;
- retained counterexamples instead of only favorable examples; and
- immutable run identities and a correction trail that explain why earlier
  campaigns were rejected.

This is methodological and empirical novelty, not algorithmic novelty. I have
not established that nobody else has performed an equivalent M4 experiment.

## What I learned

Performance experiments need two kinds of discipline. Algorithmic control
holds the data, initialization, precision, scoring and compute setting steady.
Evidence control makes every result traceable to one dataset, plan and source
tree while refusing incomplete or incompatible records.

The project transferred methods from my earlier AI-evaluation and systems work:
paired conditions, explicit seeds, frozen plans, immutable evidence,
uncertainty intervals and discriminating tests for competing explanations. The
domain changed from evaluating AI systems to measuring a numerical algorithm;
the evidence discipline remained reusable.

## What this does not claim

This work does not establish a universal CPU speedup, reproduce the paper's GPU
results, prove a causal explanation for the speedup, measure energy use or show
better vector-search recall. The epoch-four crossing is a checkpoint from an
e-means schedule configured for five epochs, not a separately tuned four-epoch
run.

## Sources

- [e-means paper](https://arxiv.org/abs/2611.09501)
- [Faiss e-means implementation](https://github.com/facebookresearch/faiss/tree/main/benchs/e_means)
- [Yandex description of Deep1B](https://research.yandex.com/blog/benchmarks-for-billion-scale-similarity-search)
