document.addEventListener("DOMContentLoaded", function () {
    const width = 1200,
          height = 500;

    // ==========================================
    // 🎛️ TWEAK SETTINGS: OPTIMIZED FOR PAPER CLUSTERING
    // ==========================================
    const CONFIG = {
        initialZoom: 0.9,          
        nodeBaseRadius: 6,         
        nodeSizeMultiplier: 2,     
        linkBaseDistance: 100,      
        linkStrengthBase: 0.2,     
        linkStrengthWeight: 0.3,   
        repulsionStrength: -1800,   
        collisionBuffer: 10,       
        globalGravity: 0.1       
    };
    // ==========================================

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select("#network-graph").append("svg")
        .attr("width", "100%") 
        .attr("height", "100%") // Changed to 100% to fill fullscreen space dynamically
        .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");

    const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);
    
    svg.call(zoom.transform, d3.zoomIdentity
        .translate(width / 2, height / 2) 
        .scale(CONFIG.initialZoom)                      
        .translate(-width / 2, -height / 2)
    );

    d3.json("assets/js/coauthor_data.json").then(data => {
        const matrix = data.matrix;
        const authors = data.authors;
        const authorCounts = data.author_counts;

        const nodes = authors.map((name, index) => ({
            id: index,
            name: name,
            count: authorCounts[name] || 1
        }));

        const links = [];
        for (let i = 0; i < matrix.length; i++) {
            for (let j = i + 1; j < matrix[i].length; j++) {
                if (matrix[i][j] > 0) {
                    links.push({
                        source: i,
                        target: j,
                        weight: matrix[i][j]
                    });
                }
            }
        }

        const maxCount = d3.max(nodes, d => d.count) || 1;

        // Center force tracker elements
        const centerForce = d3.forceCenter(width / 2, height / 2);
        const xForce = d3.forceX(width / 2).strength(CONFIG.globalGravity);
        const yForce = d3.forceY(height / 2).strength(CONFIG.globalGravity);

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(CONFIG.linkBaseDistance).strength(d => CONFIG.linkStrengthBase + (d.weight * CONFIG.linkStrengthWeight))) 
            .force("charge", d3.forceManyBody().strength(CONFIG.repulsionStrength)) 
            .force("center", centerForce)
            .force("x", xForce)
            .force("y", yForce)
            .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.count) * CONFIG.nodeSizeMultiplier + CONFIG.collisionBuffer));

        simulation.alpha(1).alphaMin(0.001).alphaDecay(0.015).restart();

        const link = g.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.4)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.weight) * 2.5);

        const node = g.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(drag(simulation));

        node.append("circle")
            .attr("r", d => Math.sqrt(d.count) * CONFIG.nodeSizeMultiplier + CONFIG.nodeBaseRadius)
            .attr("fill", d => color(d.id))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        node.append("text")
            .attr("x", d => Math.sqrt(d.count) * CONFIG.nodeSizeMultiplier + CONFIG.nodeBaseRadius + 4)
            .attr("y", "0.31em")
            .text(d => d.name)
            .style("font-size", "11px")
            .style("fill", "white")
            .style("pointer-events", "none");

        node.append("title")
            .text(d => `${d.name}\nPapers: ${d.count}`);

        simulation.on("tick", () => {
            link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // ==========================================
        // 🖥️ FULLSCREEN UI CONTROLLER
        // ==========================================
        const container = document.getElementById("network-container");
        const graphDiv = document.getElementById("network-graph");
        const fsBtn = document.getElementById("fullscreen-btn");

        fsBtn.addEventListener("click", () => {
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(err => {
                    console.error(`Error enabling fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });

        // Watch for exit/enter events to update UI icons and adjust canvas centers
        document.addEventListener("fullscreenchange", () => {
            if (document.fullscreenElement) {
                // Inside Fullscreen View
                fsBtn.innerHTML = "<span>Exit Full screen</span> 🗖";
                fsBtn.style.background = "rgba(231, 76, 60, 0.7)"; // Subtle Red indicator for close action
                
                // Set graph container height to utilize full user viewport display height
                graphDiv.style.height = "100vh"; 
                
                // Dynamically balance forces to match the true resolution center of the monitor
                const currentWidth = container.clientWidth;
                const currentHeight = container.clientHeight;
                
                svg.attr("viewBox", `0 0 ${currentWidth} ${currentHeight}`);
                centerForce.x(currentWidth / 2).y(currentHeight / 2);
                xForce.x(currentWidth / 2);
                yForce.y(currentHeight / 2);
                simulation.alpha(0.3).restart(); // Wake up physics briefly to re-center nodes cleanly
            } else {
                // Returned back to standard Embedded view
                fsBtn.innerHTML = "<span>Full screen</span> 🗖";
                fsBtn.style.background = "rgba(255, 255, 255, 0.2)";
                
                graphDiv.style.height = "500px"; // Revert to your 500px layout height preset
                
                svg.attr("viewBox", `0 0 ${width} ${height}`);
                centerForce.x(width / 2).y(height / 2);
                xForce.x(width / 2);
                yForce.y(height / 2);
                simulation.alpha(0.3).restart();
            }
        });

        function drag(simulation) {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x; d.fy = d.y;
            }
            function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
            // Added alphaTarget reduction on release to allow natural deceleration settling
            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null; d.fy = null;
            }
            return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        }
    });
});