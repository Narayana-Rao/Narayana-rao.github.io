document.addEventListener("DOMContentLoaded", function () {
    const width = 600,
          height = 600,
          maxOuterRadius = Math.min(width, height) * 0.5 - 170;

    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    const arc = d3.arc()
        .innerRadius(maxOuterRadius - 30)
        .outerRadius(maxOuterRadius);

    const ribbon = d3.ribbon()
        .radius(maxOuterRadius - 30);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select("#chord-diagram").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    d3.json("assets/js/coauthor_data.json").then(data => {
        // console.log(data);
        const matrix = data.matrix;
        const authors = data.authors;

        const numAuthors = authors.length;
        const outerRadius = Math.min(maxOuterRadius, numAuthors * 20);
        const innerRadius = outerRadius - 20;

        const chords = chord(matrix);

        arc.innerRadius(innerRadius).outerRadius(outerRadius);
        ribbon.radius(innerRadius);

        svg.append("g")
            .selectAll("g")
            .data(chords.groups)
            .join("g")
            .append("path")
            .attr("fill", d => color(d.index))
            .attr("d", arc)
            .on("mouseover", (event, d) => fade(d, true))
            .on("mouseout", (event, d) => fade(d, false));

        svg.append("g")
            .selectAll("path")
            .data(chords)
            .join("path")
            .attr("d", ribbon)
            .attr("fill", d => color(d.source.index))
            .attr("opacity", 0.7)
            .on("mouseover", (event, d) => fade(d, true))
            .on("mouseout", (event, d) => fade(d, false));

        const textGroup = svg.append("g")
            .selectAll("text")
            .data(chords.groups)
            .join("text")
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", d => {
                const translateDistance = outerRadius + 5;
                return `
                    rotate(${(d.angle * 180 / Math.PI - 90)})
                    translate(${translateDistance})
                    ${d.angle > Math.PI ? "rotate(180)" : ""}
                `;
            })
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
            .text(d => {
                const name = authors[d.index];
                const maxLength = Math.floor(outerRadius / 4);
                return name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
            })
            .style("font-size", "13px")
            .style("fill", "white");

        function fade(d, opacity) {
            svg.selectAll("path")
                .filter(node => node.source && (node.source.index !== d.index && node.target.index !== d.index))
                .transition()
                .style("opacity", opacity ? 0.2 : 1);
        }
    });
});