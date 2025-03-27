Chart.register(ChartDataLabels);

// Create a custom plugin for adding circle grid
const circleGridPlugin = {
    id: 'circleGrid',
    beforeDraw: function(chart) {
        const ctx = chart.ctx;
        const scale = chart.scales.r;

        // Get the actual center of the radar chart (not from chartArea)
        const centerX = scale.xCenter;  // Correct center X based on the scale
        const centerY = scale.yCenter;  // Correct center Y based on the scale

        const circleRadii = [0.2, 0.4, 0.6, 0.8, 1.0]; // Relative radii (0.2, 0.4, 0.6, 0.8, 1.0)
        const colors = 'rgba(255, 255, 255, 0.5)'; // Light color for circles

        // Set the circle style
        ctx.strokeStyle = colors;
        ctx.lineWidth = 1;

        // Draw the circles
        circleRadii.forEach(radius => {
            // Calculate the pixel radius based on the scale and relative radius value
            const radiusInPixels = scale.getDistanceFromCenterForValue(radius);
            
            // Only draw if the radius is valid (greater than 0)
            if (radiusInPixels > 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radiusInPixels, 0, Math.PI * 2);
                ctx.closePath();
                ctx.stroke();
            }
        });
    }
};

// Register the custom plugin
Chart.register(circleGridPlugin);

var ctx = document.getElementById('radar-chart').getContext('2d');

// Function to scale the data based on the max value for each axis
function scaleData(rawData, maxValues) {
    return Object.keys(rawData).map(label => rawData[label] / maxValues[label]);
}

// Fetch data from JSON and initialize the radar chart
fetch("/assets/js/radarplotdata.json")
    .then(response => response.json())
    .then(data => {
        let maxValues = data.maxValues;
        let rawData = data.rawData;
        // console.log("Loaded Data:", maxValues, rawData);

        var chartData = {
            labels: Object.keys(rawData),
            datasets: [{
                label: 'Research Metrics',
                data: scaleData(rawData, maxValues), // Scaled data
                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                borderColor: 'rgba(0, 255, 0, 1)',
                borderWidth: 2,
                pointBackgroundColor: [
                    'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)', 'rgba(255, 205, 86, 1)',
                    'rgba(255, 205, 200, 1)', 'rgba(0, 255, 0, 1)',
                    'rgba(255, 165, 0, 1)', 'rgba(255, 255, 255, 1)'
                ],
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 7
            }]
        };

        var options = {
            responsive: true,
            scales: {
                r: {
                    min: 0,
                    max: 1,
                    ticks: { display: false },
                    grid: { color: 'rgba(255, 255, 255, 0)' },
                    angleLines: { display: true, color: 'rgba(255, 255, 255, 0.5)' },
                    pointLabels: { font: { size: 16, family: 'Arial' }, color: '#FFFFFF' }
                }
            },
            plugins: {
                legend: {
                    display: false,
                    position: 'bottom',
                    labels: {
                        font: { size: 16, family: 'Arial' },
                        color: '#ffffff',
                        usePointStyle: true,
                        generateLabels: function(chart) {
                            return chart.data.labels.map((label, index) => ({
                                text: `${label}: ${rawData[label]}`,
                                fillStyle: chart.data.datasets[0].pointBackgroundColor[index],
                                strokeStyle: '#ffffff',
                                lineWidth: chart.data.datasets[0].borderWidth
                            }));
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${rawData[tooltipItem.label]}`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    font: { size: 18, family: 'Arial', weight: 'bold' },
                    formatter: (value, context) => rawData[context.chart.data.labels[context.dataIndex]],
                    color: (context) => chartData.datasets[0].pointBackgroundColor[context.dataIndex],
                    align: 'end',
                    anchor: 'center',
                    offset: 4
                }
            }
        };

        // Create the chart
        new Chart(ctx, {
            type: 'radar',
            data: chartData,
            options: options
        });
    })
    .catch(error => console.error("Error loading the JSON file:", error));