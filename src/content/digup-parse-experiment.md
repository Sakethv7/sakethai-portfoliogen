# Did a small local OCR model help my file search?

*Research note · Search evaluation · DigUp, LiteParse, OCRia-nano*

## The result

DigUp is a Mac app that finds my own files by meaning, not by file name. It can miss a page when the text is hard to read, such as a scanned page or a dense table. I tested whether a small text-reading model, running on my own Mac, would fix that. In this test it did not.

DigUp alone ranked the right page or file in its top three for 9 of my 10 questions, including both scanned files. I scored rank only. I did not check that each result also showed the expected answer. The one miss was a results table in a public paper. Two text readers parsed that paper. An AI assistant checked the two table rows my question needed, on that one page. The values were there, but both readers scrambled the table, so the column labels no longer lined up with their rows. Neither reader made DigUp find the table.

This is one failing document. It is a case study, not a benchmark.

## What the tools are

- **OCR** is optical character recognition. It is software that reads text from a picture of a page.
- **Tesseract** is a long-standing open-source OCR program.
- **LiteParse** is an open-source tool from LlamaIndex, a company that makes document-processing software for AI. It reads a PDF on my Mac and writes the text as Markdown, a plain-text format, with the page number kept.
- **OCRia-nano** is a small model from LlamaIndex that runs inside LiteParse. It reads text and tables. It runs on an ordinary processor and needs one download of about 75 MB. LlamaIndex also offers a larger cloud model, OCRia-1.5, which I did not test.

I picked this test because LlamaIndex reports that OCRia-nano beats Tesseract on its own benchmarks. Those benchmarks use other documents and not my search tool. I wanted to see the effect on my own files.

## How I tested it

1. I picked ten files. They were public papers and a public standard, two scanned papers, two diagrams, and two notes from my own projects.
2. Ten questions, each with the evidence an answer needs, were saved in version control before any text reader ran on these files. An AI coding assistant (Claude) wrote them, ran the test and did the review. I approved that saved set before the runs.
3. DigUp ran alone first. Only a file that DigUp missed would go on to a text reader.
4. For the missed file, each text reader's output was added next to the original, and all ten questions ran again. My rules asked a person to check each output page against the page image. That did not happen. The assistant checked one page, after the pages were already in the search index.

Everything ran with the network switched off for the tools, so no document left my Mac.

## What happened

| Question, in short | File | DigUp rank |
| --- | --- | --- |
| Default TCP segment size when none is announced | RFC 9293, the TCP standard | 1 |
| Trainable parameters for one LoRA setup | LoRA paper | missed |
| Recommended Adam step size and decay rates | Adam paper, scanned copy | 1 |
| Size of the autoencoder in the bias test | Adam paper, scanned copy | 2 |
| Best translation score in one comparison | Transformer paper | 1 |
| Average language-understanding score of two models | BERT paper | 1 |
| Four questions on my own diagrams and notes | Two diagrams, two notes | 1, 1, 1 and 3 |

Rank is the position of the right page or file in DigUp's result list. A top-three rank is what I scored. My saved rules also asked for the expected answer to show in the result, and that part was not checked.

A later search of the LoRA paper used different words, and DigUp ranked the original page first. So the page was findable. The question was worded in a way that did not match the table. That second search was written after the results were known, so I treat it as a clue and not as evidence.

## What this shows, and what it does not

In this test, for one dense-table question on a PDF that already had a text layer, neither reader improved the search rank. One unchecked assistant review found that both readers damaged the table. For that kind of file I would not add this step.

It does not show anything about poor-quality scans. DigUp ranked my two scans in its top three without help, and my scans were synthetic: pages of one public paper, rotated and blurred on purpose. It also does not say which reader is better in general.

I would test one more question later: does OCRia-nano help on low-quality scanned tables that DigUp misses? I would run it only after finding a real scan that DigUp fails on, with new questions saved first.
