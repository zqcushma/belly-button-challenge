const url = 'https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json';
let data = d3.json(url).then(function(data){
    // Create dropdown menu with sample names
    let dropdown = d3.select("#selDataset");
    dropdown.selectAll("option")
        .data(data.names)
        .enter()
        .append("option")
        .text(function(d) { return d; });

    // Function to update charts and metadata
    function updateCharts(selectedSample) {
        // Filter data for the selected sample
        let selectedData = data.samples.find(function(sample) {
            return sample.id === selectedSample;
        });  // Assuming there's only one sample with the selected ID

    // Sort data in descending order by sample values
    let sortedIndices = selectedData.sample_values
        .map(function(value, index) { return { value: value, index: index }; })
        .sort(function(a, b) { return b.value - a.value; })
        .map(function(item) { return item.index; });

    // Take the top 10 values for the bar chart
    let topValues = sortedIndices.slice(0, 10);

    // Bar chart
    let barTrace = {
        x: topValues.map(index => selectedData.sample_values[index]),
        y: topValues.map(index => `OTU ${selectedData.otu_ids[index]}`),
        text: topValues.map(index => selectedData.otu_labels[index]),
        type: 'bar',
        orientation: 'h'
    };
    let barLayout = {
        title: `Top 10 OTUs for Sample ${selectedSample}`
    };
    Plotly.newPlot("bar", [barTrace], barLayout);
    
    // Bubble chart
    let bubbleTrace = {
        x: selectedData.otu_ids,
        y: selectedData.sample_values,
        text: selectedData.otu_labels,
        mode: 'markers',
        marker: {
            size: selectedData.sample_values,
            color: selectedData.otu_ids
        }
    };
    let bubbleLayout = {
        title: `OTU Bubble Chart for Sample ${selectedSample}`,
        xaxis: { title: 'OTU ID' },
        yaxis: { title: 'Sample Values' }
    };
    Plotly.newPlot("bubble", [bubbleTrace], bubbleLayout);

    // Display metadata
    let metadata = data.metadata.filter(function(meta) {
        return meta.id === parseInt(selectedSample);
    })[0];  // Assuming there's only one metadata entry for the selected ID

    // Assuming there's a div with the id 'sample-metadata' to display key-value pairs
    let metadataDisplay = d3.select("#sample-metadata");
    metadataDisplay.html("");  // Clear previous metadata
    Object.entries(metadata).forEach(([key, value]) => {
        metadataDisplay.append("p").text(`${key}: ${value}`);
    });
    }
    // Initial update with the first sample
    updateCharts(data.names[0]);

    // Event listener for dropdown change
    dropdown.on("change", function() {
        let selectedSample = dropdown.property("value");
        updateCharts(selectedSample);
    });
});