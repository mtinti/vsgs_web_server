document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.getElementById('tooltip');
    const chartContainer = document.getElementById('chart-container');
    const filtersMain = document.getElementById('filters-main');
    let mainData = [], currentMainSort = 'magnitude', expConfig = {};
    const itemHeightMain = 40;

    async function initMain() {
        try {
            const [csvResp, configResp] = await Promise.all([
                fetch('data/mainCsvData.csv'),
                fetch('data/exp_config.json')
            ]);
            const csv = await csvResp.text();
            expConfig = await configResp.json();
            parseMainData(csv);
            createChartItems();
            renderChart();
            setupFilters();
        } catch (err) {
            console.error('Failed to load data', err);
        }
    }

    function parseMainData(csv) {
        const lines = csv.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        if (!headers[0]) headers[0] = 'Experiment';
        mainData = lines.slice(1).map(line => {
            const values = line.split(',');
            const entry = {};
            headers.forEach((h, i) => {
                const key = h || `col${i}`;
                entry[key] = i === 0 ? values[i].trim() : parseFloat(values[i]) || 0;
            });
            entry.foldChange = entry.foldChange ?? entry.change ?? entry.counts ?? 0;
            entry.log2FoldChange = entry.log2FoldChange ?? entry.log2 ?? undefined;
            entry.magnitude = Math.abs(entry.log2FoldChange ?? entry.foldChange);
            return entry;
        }).filter(d => d.Experiment);
    }

    function createChartItems() {
        mainData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'chart-item';
            div.dataset.experiment = item.Experiment;
            div.innerHTML = `<div class="bar-container"><div class="diverging-bar"></div><a class="item-label" target="_blank" rel="noopener"></a></div>`;
            const label = div.querySelector('.item-label');
            label.textContent = item.Experiment;
            const config = expConfig[item.Experiment] || {};
            if (config.pubmed_id) {
                label.href = `https://pubmed.ncbi.nlm.nih.gov/${config.pubmed_id}/`;
            }
            div.addEventListener('mouseover', () => {
                tooltip.style.display = 'block';
                const title = config.title ? `${config.title}<br>` : '';
                const fc = `Fold Change: ${item.foldChange.toFixed(2)}`;
                const l2fc = item.log2FoldChange !== undefined ? `<br>Log2 Fold Change: ${item.log2FoldChange.toFixed(2)}` : '';
                tooltip.innerHTML = `<strong>${item.Experiment}</strong><br>${title}${fc}${l2fc}`;
            });
            div.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });
            div.addEventListener('mousemove', (e) => {
                tooltip.style.left = `${e.clientX + 15}px`;
                tooltip.style.top = `${e.clientY + 15}px`;
            });
            chartContainer.appendChild(div);
        });
    }

    function renderChart() {
        let filteredData = [...mainData];
        if (currentMainSort === 'up') filteredData = mainData.filter(d => (d.log2FoldChange ?? d.foldChange) > 0);
        else if (currentMainSort === 'down') filteredData = mainData.filter(d => (d.log2FoldChange ?? d.foldChange) < 0);

        filteredData.sort((a, b) => {
            const aVal = a.log2FoldChange ?? a.foldChange;
            const bVal = b.log2FoldChange ?? b.foldChange;
            if (currentMainSort === 'up') return bVal - aVal;
            if (currentMainSort === 'down') return aVal - bVal;
            return b.magnitude - a.magnitude;
        });

        chartContainer.style.height = `${filteredData.length * itemHeightMain}px`;
        const maxMagnitude = Math.max(...mainData.map(d => d.magnitude));
        chartContainer.querySelectorAll('.chart-item').forEach(el => el.style.display = 'none');

        filteredData.forEach((item, index) => {
            const el = chartContainer.querySelector(`[data-experiment="${item.Experiment}"]`);
            if (!el) return;
            el.style.display = 'flex';
            el.style.transform = `translateY(${index * itemHeightMain}px)`;
            const bar = el.querySelector('.diverging-bar');
            const label = el.querySelector('.item-label');
            const barWidth = maxMagnitude > 0 ? (item.magnitude / maxMagnitude) * 50 : 0;
            bar.style.width = `${barWidth}%`;
            const val = item.log2FoldChange ?? item.foldChange;
            if (val >= 0) {
                bar.className = 'diverging-bar bar-up';
                label.style.left = '51%'; label.style.right = 'auto';
            } else {
                bar.className = 'diverging-bar bar-down';
                label.style.right = '51%'; label.style.left = 'auto';
            }
            label.textContent = item.Experiment;
        });
    }

    function setupFilters() {
        filtersMain.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                currentMainSort = e.target.dataset.sort;
                filtersMain.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                renderChart();
            }
        });
    }

    initMain();
});
