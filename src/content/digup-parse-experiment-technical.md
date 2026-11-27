# Did a small local OCR model help my file search?

*Technical report · Search evaluation · DigUp 0.6.1, LiteParse 2.21.2, OCRia-nano 1.0.0*

## Decision

Reject local OCR preprocessing for PDFs with a text layer and dense tables. The evidence is one failing document (n=1). Benefit on scanned documents is untested, because the DigUp baseline passed both scanned files.

## Setup

- **Machine:** Apple M4, macOS 27.2.1.
- **Versions:** DigUp 0.6.1 (command-line helper inside the app), LiteParse 2.21.2, OCRia-nano 1.0.0, ONNX Runtime 1.31.1.
- **Isolation:** every parse, index and search call ran under `sandbox-exec` with `(deny network*)`. The script first checks that a network call fails inside the sandbox. Each stage used its own `--index` folder and never touched the DigUp app's own index.
- **Freeze:** manifest, questions and protocol committed before any parser ran. Each ledger row stores the commit hash. The script exits with code 2 if a frozen file differs from the commit.
- **Engine selection:** every `lit parse` call passes `--ocr-backend` and `--dpi 250`. The script checks that the log contains `table model` lines if and only if the engine is `ocria-nano`.
- **Output:** one Markdown file and one JSON file per page, with source path, source hash, page, engine, engine version, run id and frozen commit in the front matter.

## Protocol

1. Baseline: `digup search --json -n 10` on the originals for each of ten questions.
2. Pass rule as frozen: the expected page is in the top three and the evidence is present. As run: only rank was scored, and evidence was not checked for any question. For Markdown and images DigUp reports no page, so the whole file counts.
3. Only files with a baseline miss are parsed, once per engine. The frozen limits were 600 s per file per engine and 100 MB of derived output per engine. The code applied 600 s per parser call and did not enforce the storage bound. Parsing took under 10 s and output was about 1.1 MB per engine.
4. All ten questions run again with originals and derived pages in one index.
5. Frozen rule: a person compares each parsed page with its image, and a failing page is kept out of the index. As run: no person checked any page. An AI assistant reviewed one page of 26 per engine, after all pages were indexed.
6. Adoption threshold: better on at least 3 questions and worse on none.

## Files

| Id | Class | Public source |
| --- | --- | --- |
| a01 | PDF with text layer | RFC 9293 |
| a02 | PDF with text layer | LoRA paper (arXiv 2106.09685) |
| a03 | Scanned PDF, synthetic | Pages 2 to 3 of the Adam paper (arXiv 1412.6980) |
| a04 | Scanned PDF, synthetic | Pages 7 to 8 of the Adam paper |
| a05 | PDF with tables | Transformer paper (arXiv 1706.03762) |
| a06 | PDF with tables | BERT paper (arXiv 1810.04805) |
| a07 | Diagram | From my own projects |
| a08 | Diagram | From my own projects |
| a09 | Markdown | From my own projects |
| a10 | Markdown | From my own projects |

The scans are synthetic: pages rendered at 150 dpi, rotated by up to 0.7 degrees, blurred and noised, then saved as image-only PDFs.

## Results

| Q | Artifact | Expected | Baseline | Tesseract | OCRia-nano |
| --- | --- | --- | --- | --- | --- |
| q01 | a01 | p33 | 1 | 1 | 1 |
| q02 | a02 | p6 | null | null | null |
| q03 | a03 | p1 | 1 | 1 | 1 |
| q04 | a04 | p2 | 2 | 2 | 2 |
| q05 | a05 | p8 | 1 | 1 | 1 |
| q06 | a06 | p6 | 1 | 1 | 1 |
| q07 | a07 | file | 3 | 3 | 3 |
| q08 | a08 | file | 1 | 1 | 1 |
| q09 | a09 | file | 1 | 1 | 1 |
| q10 | a10 | file | 1 | 1 | 1 |

Rank is the position in the result list. Null means not returned in the top ten.

| Stage | Parse, 26 pages | Derived size | Index size | Index time |
| --- | --- | --- | --- | --- |
| Baseline | not applicable | 0 | 1.90 MB | 41.6 s |
| Tesseract | 4.1 s | 1.06 MB | 2.29 MB | 54.0 s |
| OCRia-nano | 6.3 s | 1.08 MB | 2.36 MB | 56.2 s |

Each search took 0.41 to 0.52 s. The LoRA paper has a text layer, so LiteParse used it and ran OCR only on embedded images. That explains the low parse times.

## Review of a02, page 6 (Table 2)

Scope: an AI assistant checked the two DeBXXL rows and the table structure on this page only. No person reviewed it.

From the page image: DeBXXL (FT)* 1500.0M 91.8 97.2 92.0 72.0 96.0 92.7 93.9 92.9 91.1. DeBXXL (LoRA) 4.7M 91.9 96.9 92.6 72.4 96.0 92.9 94.9 93.0 91.3.

- **Tesseract:** values of both rows present. The two DeBXXL rows merge into one line. The QNLI to Avg. cells of the LoRA row sit in a separate block with no header. The header QQP, RTE, STS-B, Avg. is in another table. Fail: detached header.
- **OCRia-nano:** values of both rows present, with CoLA and QNLI swapped in order in the FT row. The header cells run QQP, RTE, Avg., STS-B. One merged cell holds both row labels. The LoRA values share one cell with no row label. Fail: detached row label and misordered header.

Post-hoc probe, written after seeing results and so not evidence: the query "DeBXXL LoRA 4.7M GLUE adaptation methods table" ranked the original page 6 first in both indexes, with the derived page 6 second. Page 6 was indexed and findable. The q02 miss comes from the wording of the question.

## Deviations and corrections

- The first baseline run used a scorer that required a page number for Markdown files and images. It reported three false misses. The assistant fixed the scorer, ran again and kept the first run's rows in the log, marked superseded. The frozen files did not change.
- The LiteParse log does not name the engine. The check uses the table-model signature, which is indirect.
- OCRia-nano runs a table model that Tesseract has no counterpart for. Both used 250 dpi. The result therefore describes OCRia-nano as a package.
- After the OCRia-nano download, the default engine becomes OCRia-nano. This is why every call sets the engine.
- A plumbing test on a synthetic page showed Tesseract reading 5.9 as 59 while DigUp still ranked the page first. That result is excluded from the evidence.

## What the vendor reports

LlamaIndex lists these CPU numbers for LiteParse in its README. I did not re-run them. They use other documents and other metrics than my test.

| Benchmark | Tesseract (default) | OCRia-nano |
| --- | --- | --- |
| ParseBench-2 | 48.7 | 59.2 |
| OmniParseBench | 42.3 | 74.8 |
| olmOCR-bench | 45.7 | 60.9 |
| BHL character error rate (lower is better) | 0.275 | 0.048 |
| Pages per second | 14.2 | 27.8 |

My result does not contradict these numbers. They measure other things on other documents.

## License

The OCRia-nano weights use a modified OpenRAIL-M license, separate from the Apache 2.0 license of LiteParse. Evaluating, benchmarking and publishing results count as research use. Personal use is allowed. Commercial use is restricted above 2 million US dollars of revenue or funding, and use inside a competing document-parsing service is restricted outside research. This is my reading, not legal advice.

## Limits

- One failing document, so no statistical claim.
- The scans are synthetic.
- An AI coding assistant (Claude) wrote the questions and scripts, ran the stages and did the one page review. I approved the frozen set. No person checked any page.
- Evidence presence was never scored. Rank results do not show that the retrieved text answered the question.
- Pages were indexed before the review, so a failed page was not kept out.
- Expected evidence for the PDFs with a text layer came from that layer, not from page images.
- The engine check is a log signature and not an engine name.
- The open hypothesis, whether OCRia-nano helps on low-quality scanned tables that DigUp misses, is untested.
