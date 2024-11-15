Chart.register(ChartDataLabels);
var ctx = document.getElementById('radar-chart').getContext('2d');

// Define the maximum value for each axis (for scaling purposes)
var maxValues = {
    'Citations': 400,
    'h-index': 15,
    'i10-index': 15,
    'Journal articles': 20,
    'Conference articles': 30,
    'Conference abstracts': 30,
    'Book chapters': 5,
    'Preprints': 5,
    'Co-authors': 70,
    'Co-institutions': 30
};

// Sample data before scaling
var rawData = {
    'Citations': 320,
    'h-index': 9,
    'i10-index': 8,
    'Journal articles': 12,
    'Conference articles': 22,
    'Conference abstracts': 16,
    'Book chapters': 1,
    'Preprints': 2,
    'Co-authors': 42,
    'Co-institutions': 17
};

// Function to scale the data based on the max value for each axis
function scaleData(rawData, maxValues) {
    var scaledData = [];
    for (var label in rawData) {
        if (rawData.hasOwnProperty(label)) {
            scaledData.push(rawData[label] / maxValues[label]);
        }
    }
    return scaledData;
}

var data = {
    labels: ['Citations', 'h-index', 'i10-index', 'Journal articles', 'Conference articles', 'Conference abstracts', 'Book chapters', 'Preprints', 'Co-authors', 'Co-institutions'],
    datasets: [{
        label: 'Research Metrics',
        data: scaleData(rawData, maxValues), // Scaled data
        backgroundColor: 'rgba(0, 255, 0, 0.2)', // Semi-transparent fill
        borderColor: 'rgba(0, 255, 0, 1)', // Solid border
        borderWidth: 2,
        pointBackgroundColor: [
            'rgba(255, 99, 132, 1)', 
            'rgba(54, 162, 235, 1)', 
            'rgba(75, 192, 192, 1)', 
            'rgba(153, 102, 255, 1)', 
            'rgba(255, 159, 64, 1)',  
            'rgba(255, 205, 86, 1)',   
            'rgba(255, 205, 200, 1)', 
            'rgba(0, 255, 0, 1)', 
            'rgba(255, 165, 0, 1)', 
            'rgba(255, 255, 255, 1)'
        ],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 7
    }]
};

var options = {
    responsive: true,
    scale: {
        ticks: {
            beginAtZero: true,
            stepSize: 0.2,
            display: false,
        },
        gridLines: {
            color: '#ffffff',
            lineWidth: 1
        },
        angleLines: {
            color: '#ffffff'
        }
    },
    scales: {
        r: {
            min: 0,
            max: 1,
            ticks: {
                display: false,
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.5)'
            },
            angleLines: {
                display: true,
                color: 'rgba(255, 255, 255, 0.5)',
            },
            pointLabels: {
                font: {
                    size: 16,
                    family: 'Arial',
                },
                color: '#FFFFFF',
            }
        }
    },
    plugins: {
        legend: {
            display: false,
            position: 'bottom',
            labels: {
                font: {
                    size: 16,
                    family: 'Arial',
                },
                color: '#ffffff',
                usePointStyle: true,
                generateLabels: function(chart) {
                    return chart.data.labels.map(function(label, index) {
                        var actualValue = rawData[label];
                        return {
                            text: label + ': ' + actualValue,
                            fillStyle: chart.data.datasets[0].pointBackgroundColor[index],
                            strokeStyle: '#ffffff',
                            lineWidth: chart.data.datasets[0].borderWidth
                        };
                    });
                }
            }
        },
        tooltip: {
            callbacks: {
                label: function(tooltipItem) {
                    var index = tooltipItem.index;
                    var label = tooltipItem.label;
                    var actualValue = rawData[label];
                    return label + ': ' + actualValue;
                }
            }
        },
        datalabels: {
            display: true,
            color: '#FFFFFF',
            font: {
                size: 18,
                family: 'Arial',
                weight: 'bold'
            },
            formatter: function(value, context) {
                var label = context.chart.data.labels[context.dataIndex];
                var actualValue = rawData[label];
                return actualValue;
            },
            // color: function(context) {
            //     // Get the color of the point
            //     return context.chart.data.datasets[context.datasetIndex].backgroundColor[context.dataIndex];
            // },

            color: function(context) {
                // Return fixed color from a predefined color array
                var pointColors = [
                    'rgba(255, 99, 132, 1)', 
                    'rgba(54, 162, 235, 1)', 
                    'rgba(75, 192, 192, 1)', 
                    'rgba(153, 102, 255, 1)', 
                    'rgba(255, 159, 64, 1)',  
                    'rgba(255, 205, 86, 1)',   
                    'rgba(255, 205, 200, 1)', 
                    'rgba(0, 255, 0, 1)', 
                    'rgba(255, 165, 0, 1)', 
                    'rgba(255, 255, 255, 1)'
                ];
                return pointColors[context.dataIndex]; // Color based on index
            },

            align: 'end',
            anchor: 'center',
            offset:4
            // X:-10,
            // Y:4
        }
    }
};

// Create the chart
var chart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: options
});
