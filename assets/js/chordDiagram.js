document.addEventListener("DOMContentLoaded", function () {
    const width = 600,
          height = 600,
          maxOuterRadius = Math.min(width, height) * 0.5 - 170;

    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    const arc = d3.arc()
        .innerRadius(maxOuterRadius - 30) // Fixed inner radius
        .outerRadius(maxOuterRadius);

    const ribbon = d3.ribbon()
        .radius(maxOuterRadius - 30); // Same inner radius as arc

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select("#chord-diagram").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    d3.json("assets/js/coauthor_data.json").then(data => {
        console.log(data); // Check if this logs the data
        const matrix = data.matrix;
        const authors = data.authors;

        const numAuthors = authors.length;
        const outerRadius = Math.min(maxOuterRadius, numAuthors * 20); // Adjust scale accordingly
        const innerRadius = outerRadius - 20;

        const chords = chord(matrix);

        // Update arc generator with dynamic radii
        arc.innerRadius(innerRadius).outerRadius(outerRadius);
        ribbon.radius(innerRadius);

        // Draw the outer arcs (representing the authors)
        svg.append("g")
            .selectAll("g")
            .data(chords.groups)
            .join("g")
            .append("path")
            .attr("fill", d => color(d.index))
            .attr("d", arc)
            .on("mouseover", (event, d) => fade(d, true))
            .on("mouseout", (event, d) => fade(d, false));

        // Append author names radially outside
        const textGroup = svg.append("g")
            .selectAll("text")
            .data(chords.groups)
            .join("text")
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", d => {
                const translateDistance = outerRadius + 5; // Distance from center for text
                return `
                    rotate(${(d.angle * 180 / Math.PI - 90)})
                    translate(${translateDistance})
                    ${d.angle > Math.PI ? "rotate(180)" : ""}
                `;
            })
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
            .text(d => {
                // Adjust name length based on outer radius
                const name = authors[d.index];
                const maxLength = Math.floor(outerRadius / 4); // Determine max characters
                return name.length > maxLength ? name.slice(0, maxLength) + '...' : name; // Truncate if too long
            })
            .style("font-size", "13px") // Fixed font size
            .style("fill", "white")
            .on("mouseover", (event, d) => fade(d, true))
            .on("mouseout", (event, d) => fade(d, false));

        // Draw the ribbons (connections between authors)
        const ribbons = svg.append("g")
            .attr("fill-opacity", 0.75)
            .selectAll("path")
            .data(chords)
            .join("path")
            .attr("fill", d => color(d.source.index))
            .attr("stroke", d => d3.rgb(color(d.source.index)).darker())
            .attr("d", ribbon);

        // Fade effect for hover interaction
        function fade(group, isHovered) {
            console.log('fade group:', group); // Log the group object
            if (!group || !group.index) {
                throw new Error("Invalid group object passed to fade function");
            }

            const index = group.index;

            ribbons
                .classed("glow", d => isHovered && (d?.source?.index === index || d?.target?.index === index) && index !== 0)
                // .classed("fade", d => isHovered && d?.source?.index !== index && d?.target?.index !== index && d?.source?.index !== group.source.index && d?.target?.index !== group.target.index);
                .classed("fade", d => isHovered && d.source.index !== index && d.target.index !== index && d.source.index !== group.source.index && d.target.index !== group.target.index);
            
                // Fade out unrelated ribbons
            // Highlight ribbons connected to the hovered author
            // ribbons
                // .classed("glow", d => isHovered && (d.source.index === index || d.target.index === index))
                // .classed("fade", d => isHovered && !(d.source.index === index || d.target.index === index));


            svg.selectAll("path")
                .filter((d, i) => i !== index)
                .classed("fade", isHovered);

            svg.selectAll("text")
                .filter((d, i) => i !== index)
                .classed("fade", isHovered);
        }
    });
});

