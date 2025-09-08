document.addEventListener('DOMContentLoaded', async () => {
    const statsEl = document.getElementById('stats');
    try {
        const response = await fetch('data/exp_config.json');
        const expConfig = await response.json();
        const papers = new Set();
        const factors = new Set();
        let runCount = 0;
        const readTypes = {};
        Object.keys(expConfig).forEach(key => {
            const exp = expConfig[key];
            papers.add(exp.pubmed_id);
            factors.add(key.split('_')[0]);
            const runs = (exp.controls ? exp.controls.length : 0) +
                         (exp.treatments ? exp.treatments.length : 0);
            runCount += runs;
            const type = exp.fastq_type || 'unknown';
            readTypes[type] = (readTypes[type] || 0) + runs;
        });
        const readTypeText = Object.entries(readTypes)
            .map(([type, count]) => `${count} ${type}`)
            .join(', ');
        statsEl.innerHTML = `
            <li><span class="font-bold">${papers.size}</span> papers</li>
            <li><span class="font-bold">${factors.size}</span> factors</li>
            <li><span class="font-bold">${runCount}</span> run accession numbers</li>
            <li><span class="font-bold">${readTypeText}</span> run accession numbers by read type</li>`;
    } catch (err) {
        statsEl.innerHTML = '<li class="text-red-400">Failed to load statistics.</li>';
        console.error(err);
    }
});
