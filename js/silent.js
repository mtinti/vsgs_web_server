document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const tooltip = document.getElementById('tooltip');
    const leaderboardContainer = document.getElementById('leaderboard-container');
    const filtersSilent = document.getElementById('filters-silent');
    const expanderContainer = document.getElementById('expander-container');
    let silentData = [], currentSilentSort = 'sum', isExpanded = false, expConfig = {};
    const itemHeightSilent = 76, displayLimit = 20;

    const moveTooltip = (event) => {
        if (!tooltip) return;
        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY + 15}px`;
    };

    async function initSilent() {
        try {
            const [csvResp, configResp] = await Promise.all([
                fetch('data/silentCsvData.csv'),
                fetch('data/exp_config.json')
            ]);
            const csv = await csvResp.text();
            expConfig = await configResp.json();
            parseSilentData(csv);
            createLeaderboardItems();
            renderLeaderboard();
            setupFilters();
        } catch (err) {
            console.error('Failed to load silent CSV', err);
        } finally {
            if (loader) loader.style.display = 'none';
        }
    }

    function parseSilentData(csv) {
        const lines = csv.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        if (!headers[0]) headers[0] = 'Experiment';
        silentData = lines.slice(1).map(line => {
            const values = line.split(',');
            const entry = {};
            headers.forEach((h, i) => {
                entry[h] = i === 0 ? values[i].trim() : parseFloat(values[i]) || 0;
            });
            return entry;
        }).filter(d => d.Experiment);
    }

    function createLeaderboardItems() {
        silentData.forEach(item => {
            const li = document.createElement('div');
            li.className = 'leaderboard-item flex items-center p-3 bg-gray-800 rounded-lg shadow-md my-2';
            li.dataset.experiment = item.Experiment;
            li.innerHTML = `
                <div class="rank-badge w-10 h-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 font-bold text-lg mr-4 flex">
                    <span class="rank-text"></span>
                </div>
                <div class="flex-grow overflow-hidden">
                    <a class="font-semibold text-white truncate" target="_blank" rel="noopener"></a>
                    <div class="bar-container relative mt-1">
                        <span class="bar-label absolute -top-6 left-0 text-xs font-semibold text-indigo-200"></span>
                        <div class="bar-track w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                            <div class="bar bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full" style="width: 0%; transition: width 0.6s ease;"></div>
                        </div>
                    </div>
                </div>`;
            const link = li.querySelector('a');
            link.textContent = item.Experiment;
            const config = expConfig[item.Experiment] || {};
            if (config.pubmed_id) {
                link.href = `https://pubmed.ncbi.nlm.nih.gov/${config.pubmed_id}/`;
            }
            li.addEventListener('mouseover', (e) => {
                tooltip.style.display = 'block';
                const value = item[currentSilentSort];
                const title = config.title ? `${config.title}<br>` : '';
                tooltip.innerHTML = `<strong>${item.Experiment}</strong><br>${title} Fold Change ${currentSilentSort.toUpperCase()}: ${value.toFixed(2)}`;
                moveTooltip(e);
            });
            li.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });
            li.addEventListener('mousemove', moveTooltip);
            leaderboardContainer.appendChild(li);
        });
    }

    function renderLeaderboard() {
        silentData.sort((a, b) => b[currentSilentSort] - a[currentSilentSort]);
        const count = isExpanded ? silentData.length : Math.min(displayLimit, silentData.length);
        leaderboardContainer.style.height = `${count * itemHeightSilent}px`;
        const maxVal = silentData.length > 0 ? silentData[0][currentSilentSort] : 1;
        silentData.forEach((item, index) => {
            const el = leaderboardContainer.querySelector(`[data-experiment="${item.Experiment}"]`);
            if (!el) return;
            el.style.transform = `translateY(${index * itemHeightSilent}px)`;
            el.style.opacity = index < count ? '1' : '0';
            el.style.pointerEvents = index < count ? 'auto' : 'none';
            const rank = index + 1;
            const rankBadge = el.querySelector('.rank-badge');
            rankBadge.classList.remove('rank-1', 'rank-2', 'rank-3');
            if (rank <= 3) rankBadge.classList.add(`rank-${rank}`);
            el.querySelector('.rank-text').textContent = rank;
            el.querySelector('.bar').style.width = `${maxVal > 0 ? (item[currentSilentSort] / maxVal) * 100 : 0}%`;
            const label = el.querySelector('.bar-label');
            if (label) {
                if (index === 0 && silentData.length > 0) {
                    label.textContent = `Top Fold Change = ${maxVal.toFixed(2)}`;
                    label.style.opacity = '1';
                } else {
                    label.textContent = '';
                    label.style.opacity = '0';
                }
            }
        });
    }

    function setupFilters() {
        filtersSilent.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                currentSilentSort = e.target.dataset.sort;
                filtersSilent.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                renderLeaderboard();
            }
        });

        filtersSilent.querySelectorAll('button').forEach(button => {
            const tooltipText = button.dataset.tooltip;
            if (!tooltipText) return;

            button.addEventListener('mouseenter', (e) => {
                tooltip.style.display = 'block';
                tooltip.innerHTML = tooltipText;
                moveTooltip(e);
            });

            button.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });

            button.addEventListener('mousemove', moveTooltip);
        });

        if (silentData.length > displayLimit) {
            const btn = document.createElement('button');
            btn.className = 'filter-btn font-semibold py-2 px-5 rounded-full bg-gray-700 hover:bg-gray-600';
            btn.textContent = `Show All (${silentData.length})`;
            expanderContainer.appendChild(btn);
            btn.addEventListener('click', () => {
                isExpanded = !isExpanded;
                btn.textContent = isExpanded ? 'Show Less' : `Show All (${silentData.length})`;
                renderLeaderboard();
            });
        }
    }

    initSilent();
});
