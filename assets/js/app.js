// Data-Journalism-and-D3

// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var chartMargin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };
// Define dimensions of the chart area
var width = svgWidth - chartMargin.left - chartMargin.right;
var height = svgHeight - chartMargin.top - chartMargin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .style("background", "white")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group and shift ('translate') it to the left and to the top
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Import/Load data from data.csv
d3.csv("assets/data/data.csv").then(function(csvData) {

  // Step 1: Parse Data/Cast as numbers for each piece of data
  // ==============================
  csvData.forEach(function(data) {
    // parse data
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    //console.log("Check Poverty data", data.poverty);
    //console.log("Check Healthcare data", data.healthcare);
  });
    console.log("After CSV file data load.")
 
  // Step 2: Create scale functions
  // ==============================
  // Create a linear scale for poverty for the vertical axis.
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d.poverty)-2, d3.max(csvData, d => d.poverty)+2])
    .range([0, width]);

  //Create Linear scale for healthcare for the horizontal axis.
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d.healthcare)-2, d3.max(csvData, d => d.healthcare)+2])
    .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    /// Create two new functions passing our scales in as arguments
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    // Append two SVG group elements to the chartGroup area,
    // and create the bottom and left axes inside of them
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    // Create one SVG circle per piece of data
    // Use the linear scales to position each circle within the chart

    var circlesGroup = chartGroup.selectAll("circle")
    .data(csvData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "10")
    .attr("fill", "darkblue")
    .attr("opacity", ".8");

    var circleLabels = chartGroup.selectAll(null).data(csvData).enter().append("text");
    circleLabels
    .attr("x", function(d) {
      return xLinearScale(d.poverty);
    })
    .attr("y", function(d) {
      return yLinearScale(d.healthcare);
    })
    .text(function(d) {
      return d.abbr;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("fill", "white");
    
    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .style("background-color", "black")
      .style("color","white")
      //.style("padding", "5px")
      .html(function(d) {
        return (`${d.abbr}<br>Poverty ${d.poverty}<br>Lacks Healthcare: ${d.healthcare}`);
      });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });
  
      circleLabels.on("click", function(data) {
        toolTip.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - chartMargin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + chartMargin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");   

    }).catch(function(error) {
        console.log(error);
      });
