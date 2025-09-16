// Load experiment configuration and render searchable table

const escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const parseCsv = (text) => {
    const rows = [];
    let current = [];
    let value = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (insideQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    value += '"';
                    i += 1;
                } else {
                    insideQuotes = false;
                }
            } else {
                value += char;
            }
        } else if (char === '"') {
            insideQuotes = true;
        } else if (char === ',') {
            current.push(value);
            value = '';
        } else if (char === '\r') {
            continue;
        } else if (char === '\n') {
            current.push(value);
            rows.push(current);
            current = [];
            value = '';
        } else {
            value += char;
        }
    }

    if (value !== '' || insideQuotes || current.length) {
        current.push(value);
        rows.push(current);
    }

    return rows;
};

const loadSampleMetadata = async () => {
    try {
        const resp = await fetch('data/samplesheet.csv');
        if (!resp.ok) {
            console.warn('Samplesheet request failed', resp.status, resp.statusText);
            return new Map();
        }
        let text = await resp.text();
        if (!text.trim()) return new Map();
        if (text.charCodeAt(0) === 0xfeff) {
            text = text.slice(1);
        }
        const rows = parseCsv(text).filter((row) => row && row.length);
        if (!rows.length) return new Map();
        const headers = rows[0].map((header) => header.trim());
        const columnIndex = headers.reduce((acc, header, idx) => {
            acc[header] = idx;
            return acc;
        }, {});
        const required = ['sample', 'run_accession', 'sample_title', 'sample_alias', 'library_name'];
        const missing = required.filter((column) => !(column in columnIndex));
        if (missing.length) {
            console.warn('Samplesheet missing expected columns', missing);
            return new Map();
        }
        const getValue = (row, idx) => {
            if (idx < 0 || idx >= row.length) return '';
            const cell = row[idx];
            return typeof cell === 'string' ? cell.trim() : '';
        };
        const sampleMap = new Map();
        rows.slice(1).forEach((row) => {
            if (!row || !row.length) return;
            const sampleId = getValue(row, columnIndex.sample);
            const runId = getValue(row, columnIndex.run_accession);
            if (!sampleId && !runId) return;
            const entry = {
                sample: sampleId,
                run_accession: runId,
                sample_title: getValue(row, columnIndex.sample_title),
                sample_alias: getValue(row, columnIndex.sample_alias),
                library_name: getValue(row, columnIndex.library_name),
            };
            const setIfAbsent = (key) => {
                if (key && !sampleMap.has(key)) {
                    sampleMap.set(key, entry);
                }
            };
            setIfAbsent(sampleId);
            setIfAbsent(runId);
        });
        return sampleMap;
    } catch (err) {
        console.error('Failed to load samplesheet metadata', err);
        return new Map();
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const table = document.getElementById('exp-table');
    if (!table) return;
    try {
        const resp = await fetch('data/exp_config.json');
        if (!resp.ok) {
            throw new Error(`Failed to load experiment config: ${resp.status} ${resp.statusText}`);
        }
        const config = await resp.json();
        const sampleMetadata = await loadSampleMetadata();
        const tbody = table.querySelector('tbody');
        Object.entries(config).forEach(([experiment, info]) => {
            const pub = info.pubmed_id || '';
            const safeExperiment = escapeHtml(experiment);
            const safePub = pub ? escapeHtml(pub) : '';
            const pubCell = safePub
                ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${safePub}/" target="_blank" class="text-indigo-400 hover:underline">${safePub}</a>`
                : '';
            const addRow = (runId, type) => {
                const runKey = typeof runId === 'string' ? runId.trim() : String(runId ?? '');
                const metadata = sampleMetadata.get(runKey) || {};
                const safeType = escapeHtml(type);
                const safeRunId = escapeHtml(runKey);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${safeExperiment}</td>
                    <td>${safeType}</td>
                    <td>${safeRunId}</td>
                    <td>${escapeHtml(metadata.sample_title || '')}</td>
                    <td>${escapeHtml(metadata.sample_alias || '')}</td>
                    <td>${escapeHtml(metadata.library_name || '')}</td>
                    <td>${pubCell}</td>
                `;
                tbody.appendChild(tr);
            };
            (info.controls || []).forEach((run) => addRow(run, 'control'));
            (info.treatments || []).forEach((run) => addRow(run, 'treatment'));
        });
        new simpleDatatables.DataTable(table);
    } catch (err) {
        console.error('Failed to load experiment config', err);
    }
});
