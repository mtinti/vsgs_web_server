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

---

Please open an issue or submit a pull request if you have suggestions or improvements.

