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
            renderBoxPlot(data, 'Main_VSG_perc', '#qc-main');
            renderBoxPlot(data, 'Mito_perc', '#qc-mito');
        } catch (err) {
            console.error('Failed to load QC CSV', err);
        } finally {
            if (loader) loader.style.display = 'none';
        }
    }

    function renderBoxPlot(data, column, selector) {
        const svg = d3.select(selector);
        const width = svg.node().getBoundingClientRect().width;
        const height = svg.node().getBoundingClientRect().height;
        const margin = { top: 10, right: 20, bottom: 30, left: 20 };

        const values = data.map(d => d[column]).sort(d3.ascending);
        const x = d3.scaleLinear()
            .domain([0, d3.max(values)]).nice()
            .range([margin.left, width - margin.right]);

        const yCenter = (height - margin.top - margin.bottom) / 2 + margin.top;
        const boxHeight = Math.min(40, height - margin.top - margin.bottom);

        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const min = d3.min(values);
        const max = d3.max(values);

        svg.attr('width', width).attr('height', height);

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .attr('class', 'axis')
            .call(d3.axisBottom(x).ticks(6))
            .selectAll('text')
            .attr('fill', '#d1d5db');

        svg.selectAll('.axis path, .axis line').attr('stroke', '#4b5563');

        // Draw box
        svg.append('rect')
            .attr('x', x(q1))
            .attr('y', yCenter - boxHeight / 2)
            .attr('width', x(q3) - x(q1))
            .attr('height', boxHeight)
            .attr('fill', '#1f2937')
            .attr('stroke', '#d1d5db');

        // Median line
        svg.append('line')
            .attr('x1', x(median))
            .attr('x2', x(median))
            .attr('y1', yCenter - boxHeight / 2)
            .attr('y2', yCenter + boxHeight / 2)
            .attr('stroke', '#d1d5db');

        // Whiskers
        svg.append('line')
            .attr('x1', x(min))
            .attr('x2', x(max))
            .attr('y1', yCenter)
            .attr('y2', yCenter)
            .attr('stroke', '#d1d5db');

        svg.append('line')
            .attr('x1', x(min))
            .attr('x2', x(min))
            .attr('y1', yCenter - boxHeight / 4)
            .attr('y2', yCenter + boxHeight / 4)
            .attr('stroke', '#d1d5db');

        svg.append('line')
            .attr('x1', x(max))
            .attr('x2', x(max))
            .attr('y1', yCenter - boxHeight / 4)
            .attr('y2', yCenter + boxHeight / 4)
            .attr('stroke', '#d1d5db');

        // Overlay points
        const points = data.map(d => ({ ...d }));
        const simulation = d3.forceSimulation(points)
            .force('x', d3.forceX(d => x(d[column])).strength(1))
            .force('y', d3.forceY(yCenter).strength(1))
            .force('collide', d3.forceCollide(4))
            .stop();

        for (let i = 0; i < 250; ++i) simulation.tick();

        svg.append('g')
            .selectAll('circle')
            .data(points)
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
