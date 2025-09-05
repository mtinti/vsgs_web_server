document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const tooltip = document.getElementById('tooltip');
    const leaderboardContainer = document.getElementById('qc-leaderboard');
    const filtersQC = document.getElementById('filters-qc');
    const expanderContainer = document.getElementById('qc-expander');
    let qcData = [], currentSort = 'Main_VSG_perc', isExpanded = false, expConfig = {};
    const itemHeight = 76, displayLimit = 20;

    async function initQC() {
        try {
            const [csvResp, configResp] = await Promise.all([
                fetch('data/QC.csv'),
                fetch('data/exp_config.json')
            ]);
            const csv = await csvResp.text();
            expConfig = await configResp.json();
            parseQCData(csv);
            createLeaderboardItems();
            renderLeaderboard();
            setupFilters();
        } catch (err) {
            console.error('Failed to load QC CSV', err);
        } finally {
            if (loader) loader.style.display = 'none';
        }
    }

    function parseQCData(csv) {
        const lines = csv.trim().split('\n');
        qcData = lines.slice(1).map(line => {
            const parts = line.split(',');
            return {
                Experiment: parts[1].trim(),
                Main_VSG_perc: parseFloat(parts[2]) || 0,
                Mito_perc: parseFloat(parts[3]) || 0
            };
        }).filter(d => d.Experiment);
    }

    function createLeaderboardItems() {
        qcData.forEach(item => {
            const li = document.createElement('div');
            li.className = 'leaderboard-item flex items-center p-3 bg-gray-800 rounded-lg shadow-md my-2';
            li.dataset.experiment = item.Experiment;
            li.innerHTML = `
                <div class="rank-badge w-10 h-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 font-bold text-lg mr-4 flex">
                    <span class="rank-text"></span>
                </div>
                <div class="flex-grow overflow-hidden">
                    <a class="font-semibold text-white truncate" target="_blank" rel="noopener">${item.Experiment}</a>
                    <div class="w-full bg-black/30 rounded-full h-2.5 mt-1 overflow-hidden">
                        <div class="bar bg-gradient-to-r from-green-500 to-blue-500 h-2.5 rounded-full" style="width: 0%; transition: width 0.6s ease;"></div>
                    </div>
                </div>`;
            const link = li.querySelector('a');
            const config = expConfig[item.Experiment] || {};
            if (config.pubmed_id) {
                link.href = `https://pubmed.ncbi.nlm.nih.gov/${config.pubmed_id}/`;
            } else {
                link.removeAttribute('href');
            }
            li.addEventListener('mouseover', () => {
                tooltip.style.display = 'block';
                const value = item[currentSort];
                const title = config.title ? `${config.title}<br>` : '';
                tooltip.innerHTML = `<strong>${item.Experiment}</strong><br>${title}${currentSort}: ${(value * 100).toFixed(2)}%`;
            });
            li.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });
            li.addEventListener('mousemove', (e) => {
                tooltip.style.left = `${e.clientX + 15}px`;
                tooltip.style.top = `${e.clientY + 15}px`;
            });
            leaderboardContainer.appendChild(li);
        });
    }

    function renderLeaderboard() {
        qcData.sort((a, b) => b[currentSort] - a[currentSort]);
        const count = isExpanded ? qcData.length : Math.min(displayLimit, qcData.length);
        leaderboardContainer.style.height = `${count * itemHeight}px`;
        const maxVal = qcData.length > 0 ? qcData[0][currentSort] : 1;
        qcData.forEach((item, index) => {
            const el = leaderboardContainer.querySelector(`[data-experiment="${item.Experiment}"]`);
            if (!el) return;
            el.style.transform = `translateY(${index * itemHeight}px)`;
            el.style.opacity = index < count ? '1' : '0';
            el.style.pointerEvents = index < count ? 'auto' : 'none';
            const rank = index + 1;
            const rankBadge = el.querySelector('.rank-badge');
            rankBadge.classList.remove('rank-1', 'rank-2', 'rank-3');
            if (rank <= 3) rankBadge.classList.add(`rank-${rank}`);
            el.querySelector('.rank-text').textContent = rank;
            const bar = el.querySelector('.bar');
            bar.style.width = `${maxVal > 0 ? (item[currentSort] / maxVal) * 100 : 0}%`;
            if (currentSort === 'Main_VSG_perc') {
                bar.className = 'bar bg-gradient-to-r from-green-500 to-blue-500 h-2.5 rounded-full';
            } else {
                bar.className = 'bar bg-gradient-to-r from-pink-500 to-yellow-500 h-2.5 rounded-full';
            }
        });
    }

    function setupFilters() {
        filtersQC.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                currentSort = e.target.dataset.sort;
                filtersQC.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                renderLeaderboard();
            }
        });

        if (qcData.length > displayLimit) {
            const btn = document.createElement('button');
            btn.className = 'filter-btn font-semibold py-2 px-5 rounded-full bg-gray-700 hover:bg-gray-600';
            btn.textContent = `Show All (${qcData.length})`;
            expanderContainer.appendChild(btn);
            btn.addEventListener('click', () => {
                isExpanded = !isExpanded;
                btn.textContent = isExpanded ? 'Show Less' : `Show All (${qcData.length})`;
                renderLeaderboard();
            });
        }
    }

    initQC();
});

