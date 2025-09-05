document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.getElementById('tooltip');
    const loader = document.getElementById('loader');

    async function initQC() {
        try {
            const response = await fetch('data/QC.csv');
            const text = await response.text();
            const data = d3.csvParse(text, d => ({
                experiment: d.experiment,
                Main_VSG_perc: +d.Main_VSG_perc,
                Mito_perc: +d.Mito_perc
            }));
            renderSwarm(data, 'Main_VSG_perc', '#qc-main');
            renderSwarm(data, 'Mito_perc', '#qc-mito');
        } catch (err) {
            console.error('Failed to load QC CSV', err);
        } finally {
            if (loader) loader.style.display = 'none';
        }
    }

    function renderSwarm(data, column, selector) {
        const svg = d3.select(selector);
        const width = svg.node().getBoundingClientRect().width;
        const height = svg.node().getBoundingClientRect().height;
        const margin = { top: 10, right: 20, bottom: 30, left: 20 };

        const swarmData = data.map(d => ({ ...d }));

        const x = d3.scaleLinear()
            .domain([0, d3.max(swarmData, d => d[column])]).nice()
            .range([margin.left, width - margin.right]);

        const yCenter = (height - margin.top - margin.bottom) / 2 + margin.top;

        const simulation = d3.forceSimulation(swarmData)
            .force('x', d3.forceX(d => x(d[column])).strength(1))
            .force('y', d3.forceY(yCenter))
            .force('collide', d3.forceCollide(4))
            .stop();

        for (let i = 0; i < 250; ++i) simulation.tick();

        svg.attr('width', width).attr('height', height);

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .attr('class', 'axis')
            .call(d3.axisBottom(x).ticks(6))
            .selectAll('text')
            .attr('fill', '#d1d5db');

        svg.selectAll('.axis path, .axis line').attr('stroke', '#4b5563');

        svg.append('g')
            .selectAll('circle')
            .data(swarmData)
            .enter()
            .append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 4)
            .attr('fill', '#4f46e5')
            .on('mouseover', (event, d) => {
                tooltip.style.display = 'block';
                tooltip.innerHTML = `<strong>${d.experiment}</strong>`;
            })
            .on('mouseout', () => {
                tooltip.style.display = 'none';
            })
            .on('mousemove', (event) => {
                tooltip.style.left = `${event.clientX + 15}px`;
                tooltip.style.top = `${event.clientY + 15}px`;
            });
    }

    initQC();
});
