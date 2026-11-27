# Did a small local OCR model help my file search?

*Engineering case study · Search evaluation · DigUp, LiteParse, OCRia-nano*

## The result

I tested whether local OCR preprocessing improves DigUp, a Mac app that searches my own files by meaning. DigUp alone ranked the expected page or file in its top three for 9 of 10 frozen questions. Neither Tesseract nor OCRia-nano fixed the one miss, a dense table in a PDF with a text layer. One AI assistant review of that page found that both outputs broke the table structure. My decision is to reject this preprocessing for that kind of file.

The sample is small, and the checks were thinner than my own rules required. An AI coding assistant (Claude) wrote the questions, ran the test and did the review. I approved the frozen question set before the runs. This note covers the method, the gaps and the mistakes.

## The tools in plain words

OCR is optical character recognition: software that reads text from a picture of a page. Tesseract is an open-source OCR program and the default in LiteParse. LiteParse is an open-source parser from LlamaIndex, a company that makes document-processing software for AI. It writes Markdown or JSON and keeps the page for each piece of text. OCRia-nano is a small LlamaIndex model package that runs inside LiteParse on a CPU. It has 8.1 million parameters (the learned numbers inside a model). It adds a text-line detector, text recognizers and a table and layout model. OCRia-1.5 is a larger cloud model from the same company. I did not test it.

DigUp turns each file into an embedding, a list of numbers where similar meanings give similar numbers. It then searches by closeness. A search returns files and pages in rank order.

## Why I ran it

LlamaIndex reports that OCRia-nano beats Tesseract on its own benchmarks. I did not re-run them. They use other documents and other metrics. My question was narrower: does it change what my search tool finds in my files?

## How I tested it

1. **Pick and freeze.** Ten files in five classes: two PDFs with a text layer, two scanned PDFs, two PDFs with tables, two diagrams and two Markdown notes. Ten questions, each naming the expected file, the expected page and the exact evidence. I committed all of it to git. Every result row carries the commit hash, and the script refuses to run if a frozen file changed.
2. **Baseline.** DigUp alone. The rules said a question passes when the right page is in the top three and the result shows the expected evidence. The script scored rank only.
3. **Parse failures only.** The failing file is parsed with each engine, both at 250 dpi (the resolution at which pages are drawn before reading), with the network switched off.
4. **One Markdown file per page.** Each file records the source, the page, the engine and the engine version. One file per page lets a reviewer check a search hit against one page image.
5. **Ask all ten questions again.** The originals and the new pages sit in one index, so a regression on a passing question would show.
6. **Page review, only partly done.** The rules asked a person to compare each parsed page with its image, and to keep a failed page out of the index. No person checked any page. The assistant checked one page of 26 per engine, after all pages were indexed.

## What happened

DigUp alone ranked the expected page in the top three for 9 of 10 questions. It found both scanned PDFs with no extra step, so no scan miss existed for OCR to fix. The only miss was a table on page 6 of the LoRA paper, a public paper on adapting large language models. Only that file went to the engines.

Both engines ran offline. Neither moved the failing question. The other nine kept the same ranks, so nothing regressed.

The assistant compared page 6 with its image. It checked the two DeBERTa rows and the table structure, and no other value or page.

- **Tesseract:** the values in the two rows are present. The rows merge into one line. The last columns of the LoRA row, including the average, float with no header. The header sits in a different table.
- **OCRia-nano:** the values in the two rows are present, with two swapped in order in the fine-tuned row. The header cells come out in the wrong order. One cell holds both row labels. The LoRA values sit in one cell with no row label.

The rule treats a detached label as a failure. By this single review, both engines fail it on this page.

A second search with more keywords followed. It was written after the results were known, so it is a clue and not evidence. DigUp ranked the original page 6 first in both indexes. So the page was indexed and findable, and the miss likely comes from how the question was worded.

## What went wrong on the way

- **The default engine changes.** After the OCRia-nano download, a run with no engine setting silently uses OCRia-nano. Every call now names the engine.
- **The log does not name the engine.** An OCRia-nano run prints table-model lines and a Tesseract run does not. The script checks that signature against the requested engine and stops if they disagree. This check is indirect.
- **The engines differ in more than OCR.** OCRia-nano draws pages at 250 dpi and runs a table model. Tesseract draws pages at 150 dpi. I forced 250 dpi on both. The table model still runs only with OCRia-nano, so the result describes OCRia-nano as a package.
- **The scorer had a bug.** It demanded a page number for Markdown files and images, which DigUp does not report. That hid three passes. The assistant fixed the scorer, ran again and kept the bad rows in the log with a note. The frozen questions did not change.
- **Rank alone hides errors.** In a plumbing test on a synthetic page, Tesseract read 5.9 as 59 and DigUp still ranked that page first. That is why a wrong number fails a page whatever its rank.
- **The model has its own license.** The OCRia-nano weights use a modified OpenRAIL-M license, separate from the Apache license of LiteParse. Evaluation, benchmarking and publishing results count as research use under it. Personal use is allowed. Commercial use has revenue and funding limits, and use inside a document-parsing product is restricted. This is my reading, not legal advice.

## What this shows, and what it does not

For one dense-table question on a PDF with a text layer, neither engine improved the rank, and one assistant review found both damaged the table. I reject this step for that kind of file.

It does not show how the engines do on poor-quality scans. DigUp ranked my two scans in its top three unaided, and my scans were synthetic: pages of one public paper, rotated, blurred and noised. One failing document gives no statistical claim. The assistant wrote both the questions and the one review, and no person checked any page. The expected evidence for the PDFs with a text layer came from that layer, not from page images.

## The question I left open

Does OCRia-nano help on low-quality scanned tables that DigUp misses? I would run that only after finding a real scan that DigUp fails on, with new questions saved in a new commit first.
