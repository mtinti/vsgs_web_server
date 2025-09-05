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
            renderBarPlot(data, 'Main_VSG_perc', '#qc-main');
            renderBarPlot(data, 'Mito_perc', '#qc-mito');
        } catch (err) {
            console.error('Failed to load QC CSV', err);
        } finally {
            if (loader) loader.style.display = 'none';
        }
    }

    function renderBarPlot(data, column, selector) {
        const svg = d3.select(selector);
        const width = svg.node().getBoundingClientRect().width;
        const height = svg.node().getBoundingClientRect().height;
        const margin = { top: 10, right: 20, bottom: 30, left: 40 };

        const sorted = [...data].sort((a, b) => d3.descending(a[column], b[column]));

        const x = d3.scaleBand()
            .domain(d3.range(sorted.length))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(sorted, d => d[column])]).nice()
            .range([height - margin.bottom, margin.top]);

        svg.attr('width', width).attr('height', height);

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .attr('class', 'axis')
            .call(d3.axisLeft(y).ticks(5))
            .selectAll('text')
            .attr('fill', '#d1d5db');

        svg.selectAll('.axis path, .axis line').attr('stroke', '#4b5563');

        svg.append('g')
            .selectAll('rect')
            .data(sorted)
            .enter()
            .append('rect')
            .attr('x', (d, i) => x(i))
            .attr('y', d => y(d[column]))
            .attr('width', x.bandwidth())
            .attr('height', d => y(0) - y(d[column]))
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

