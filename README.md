## VSGs Web Server

This repository contains the visualization layer for a meta-analysis of RNA-seq datasets examining **variant surface glycoprotein (VSG) deregulation** in *Trypanosoma brucei*.

### Goal of the Meta-analysis

Hundreds of publicly available RNA-seq experiments were reanalyzed in a unified Snakemake-based framework to address two central questions:

1. **Which experimental factors alter the expression of silent VSGs?**
2. **Which perturbations decrease expression of the active VSG?**

By processing all datasets through a common pipeline, we also extracted quality control (QC) metrics that can be used to benchmark future experiments.

### Live Data Table

An interactive table summarizing the meta-analysis results is available at:

<https://vsgs-web-server.pages.dev/>

### Analysis Pipeline

The Snakemake pipeline used for the standardized RNA-seq processing can be found at:

<https://github.com/mtinti/myRna-seq>


### Methodological Rationale

We adopted a streamlined approach for ranking VSG derepression across experiments, prioritizing comparability and simplicity. Since all VSG sequences were truncated to 1,200 nucleotides to capture only the diverse N-terminal domain, gene length normalization was unnecessary, making CPM (Counts Per Million) an appropriate metric for expression quantification. Rather than implementing statistical tests that would exclude the numerous experiments lacking replicates, we calculated log2 fold changes of CPM values with a pseudocount of 1 to handle zero counts. To summarize responses within a VSG family, we now report the mean fold change across all members of that family. This framing emphasizes the biological assumption that a perturbation must shift the expression program of the entire family, not just a single outlier member, to be considered a true driver of derepression.

For the silent VSG leaderboard we highlight in the dashboard, we apply an additional normalization step to focus on strong, reproducible signals. Baseline activity from each data source (BES, MES, metacycles, and array measurements) is removed by subtracting 1 from the raw values, negative results are clamped to zero, and the overall **SUM** leaderboard score is recomputed from the remaining positive contributions. By forcing each source to clear this minimum threshold before contributing to the aggregate score, experiments only rise in the rankings when multiple evidence streams show meaningful derepression.

While alternative aggregation methods (median or top-n VSGs) would produce different absolute values, our preliminary analyses indicated that the relative ranking of experiments—the primary output of interest—remained largely consistent across methods. This pragmatic approach ensures all 78 experiments contribute to the meta-analysis while maintaining mathematical simplicity and biological interpretability, making the results accessible for hypothesis generation and prioritization of factors affecting VSG silencing.



---

Please open an issue or submit a pull request if you have suggestions or improvements.

