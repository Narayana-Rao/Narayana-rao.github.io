var ctx = document.getElementById('radar-chart').getContext('2d');

        // Define the maximum value for each axis (for scaling purposes)
        var maxValues = {
            'Citations': 400, // For example, if the max citations in your dataset is 1000
            'H-index': 15,     // Assuming H-index max is 50
            'H10-index': 15,   // Assuming max value for H10-index is 10
            'Journal articles': 20,
            'Conference articles': 30,
            'Conference abstracts': 30,
            'Book chapters': 5,
            'Preprints': 5,
            'Co-authors': 100,  // Max number of co-authors
            'Co-institutions': 50  // Max number of co-authors
        };

        // Sample data before scaling
        var rawData = {
            'Citations': 320,  // Sample value, will scale down
            'H-index': 9,     // Sample value, will scale down
            'H10-index': 8,    // Sample value, will scale down            
            'Journal articles': 12,
            'Conference articles': 22,
            'Conference abstracts': 16,
            'Book chapters': 1,
            'Preprints': 2,
            'Co-authors': 50,   // Sample value, will scale down
            'Co-institutions': 30
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
            labels: ['Citations', 'H-index', 'H10-index', 'Journal articles', 'Conference articles','Conference abstracts', 'Book chapters',  'Preprints','Co-authors','Co-institutions'],
            datasets: [{
                label: 'Research Metrics',
                data: scaleData(rawData, maxValues), // Scaled data
                backgroundColor: 'rgba(0, 255, 0, 0.2)', // Semi-transparent fill
                borderColor: 'rgba(0, 255, 0, 1)', // Solid border
                borderWidth: 2,
                pointBackgroundColor: [
                    'rgba(255, 99, 132, 1)', // Red for Journal Papers
                    'rgba(54, 162, 235, 1)', // Blue for Conference Papers
                    'rgba(75, 192, 192, 1)', // Green for Citations
                    'rgba(153, 102, 255, 1)', // Purple for H-index
                    'rgba(255, 159, 64, 1)',  // Orange for H10-index
                    'rgba(255, 205, 86, 1)',   // Yellow for Co-authors
                    'rgba(255, 205, 200, 1)'   // Yellow for Co-institutions
                ], // Different color for each data point
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 7
            }]
        };

        var options = {
            responsive: true,
            scale: {
                ticks: {
                    beginAtZero: true, // Start from 0
                    stepSize: 0.2, // Ticks interval
                    display: false, // Hide the ticks (0, 0.2, 0.4, etc.)
                },
                gridLines: {
                    color: '#ffffff', // White grid lines
                    lineWidth: 1
                },
                angleLines: {
                    color: '#ffffff' // White radial lines
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 1, // Range for the radar (from 0 to 1)
                    ticks: {
                        display: false, // Hide ticks on the radial axis
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.6)' // Slightly transparent grid color
                    },
                    angleLines: {
                        display: true,
                        color: '#ffffff', // Color of the angle lines
                    },
                    pointLabels: { // Adjusting the label properties
                        font: {
                            size: 16,   // Set the font size for the labels
                            family: 'Arial', // Set font family for the labels
                            //weight: 'bold', // Set font weight (optional)
                        },
                        color: '#FFFFFF', // Set label color (e.g., green)
                    }
                }
            },
            plugins: {
                legend: {
                    display: true, // Show legend
                    position: 'bottom', // Position the legend to the right
                    labels: {
                        font: {
                            size: 16, // Font size for the legend text
                            family: 'Arial', // Font family for the legend text
                            //weight: 'bold', // Font weight for the legend text
                            // color:'#ffffff'
                        },
                        color: '#ffffff', // Color for the legend text
                        usePointStyle: true, 
                        // boxWidth: 40, 
                        generateLabels: function(chart) {
                            return chart.data.labels.map(function(label, index) {
                                var actualValue = rawData[label]; // Get the actual value from the rawData object
                                return {
                                    text: label + ': ' + actualValue, // Legend item with label and value
                                    fillStyle: chart.data.datasets[0].pointBackgroundColor[index], // Use color of the point 
                                    strokeStyle: '#ffffff',
                                    // pointStyle: 'circle', 
                                    // pointRadius: 200,
                                    //pointRadius: pointSize,
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
                }
            }
        };


        // Create the chart
        var chart = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: options
        });