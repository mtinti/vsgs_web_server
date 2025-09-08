// Load experiment configuration and render searchable table

document.addEventListener('DOMContentLoaded', async () => {
    const table = document.getElementById('exp-table');
    if (!table) return;
    try {
        const resp = await fetch('data/exp_config.json');
        const config = await resp.json();
        const tbody = table.querySelector('tbody');
        Object.entries(config).forEach(([experiment, info]) => {
            const pub = info.pubmed_id || '';
            const title = info.title || '';
            const addRow = (runId, type) => {
                const pubCell = pub ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${pub}/" target="_blank" class="text-indigo-400 hover:underline">${pub}</a>` : '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${experiment}</td>
                    <td>${type}</td>
                    <td>${runId}</td>
                    <td>${pubCell}</td>
                    <td>${title}</td>
                `;
                tbody.appendChild(tr);
            };
            (info.controls || []).forEach(run => addRow(run, 'control'));
            (info.treatments || []).forEach(run => addRow(run, 'treatment'));
        });
        new simpleDatatables.DataTable(table);
    } catch (err) {
        console.error('Failed to load experiment config', err);
    }
});
