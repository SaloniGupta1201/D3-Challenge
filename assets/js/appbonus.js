// Data-Journalism-and-D3

// Define SVG attributes
var width = parseInt(d3.select("#scatter").style("width"));
var height = width * 3/4;
var margin = 20;
var labelArea = 120;
var padding = 40;

// Create SVG object, and append an SVG group that will hold our chart

var svg = d3.select("#scatter")
    .append("svg")
    .style("background", "white")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart")

// Labels for axes=================================
// Append an SVG group - Add first g - tag for x axis text (css class)
svg.append("g").attr("class", "xLabel");
var xLabel = d3.select(".xLabel");

// Transform to adjust for xLabel
var bottomTextX =  (width + labelArea)/2;
var bottomTextY = height - margin - padding;
xLabel.attr("transform",`translate( 
            ${bottomTextX},  ${bottomTextY})` );

// x-axis (bottom) ____________
// Build xLabel details (css class)
xLabel.append("text")
    .text("In Poverty (%)")
    .attr("y", -25)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x");
xLabel
    .append("text")
    .text("Age (Median)")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x");
xLabel
    .append("text")
    .text("Household Income (Median)")
    .attr("y", 25)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x");

// y-axis (left)_
// Transform to adjust for yLabel
var leftTextX = margin + padding;
var leftTextY = (height - labelArea) / 2;

// Second g tag for yLabel (css class)
svg.append("g").attr("class", "yLabel");
var yLabel = d3.select(".yLabel");

yLabel.attr(
    "transform",
    `translate(${leftTextX}, ${leftTextY})rotate(-90)` );

// Build yLabel details (css class)
yLabel
    .append("text")
    .text("Obese (%)")
    .attr("y", -30)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y");
yLabel
    .append("text")
    .text("Smokes (%)")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y");
yLabel
    .append("text")
    .text("Lacks Healthcare (%)")
    .attr("y", 25)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y");
    
// Visualize data  _____
// Define dynamic circle radius
 var circRadius;
 function adjustRadius() {
 if (width <= 530) { circRadius = 7} 
 else { circRadius = 12}
 console.log("In the end of Adjust Circle Radius function")
 }
adjustRadius();

// Retrieve data from the CSV file and newer d3.js method
d3.csv("assets/data/data.csv").then(function(data) {
    // Current X & Y default selections
    var currentX = "poverty";
    var currentY = "obesity";
    var xMin;
    var xMax;
    var yMin;
    var yMax;
    
    // Tool Tip info box (state, X stats,  Y stats)
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .html(d => {
            //Build text box
            var stateLine = `<div>${d.state}</div>`;
            var yLine  = `<div>${currentY}: ${d[currentY]} %</div>`;
            if (currentX === "poverty") {
                xLine = `<div>${currentX}: ${d[currentX]}%</div>`} 
            else {
                xLine = `<div>${currentX}: ${parseFloat(d[currentX]).toLocaleString("en")}</div>`;}
           return stateLine + xLine + yLine;   
        })
    // Add toolTip to svg
    svg.call(toolTip);

    // Find the data max & min values for scaling
    function xMinMax() {
        xMin = d3.min(data, d => parseFloat(d[currentX]) * 0.9);
        xMax = d3.max(data, d => parseFloat(d[currentX]) * 1.10);
        console.log("In the end of XMinMax function")
    };

    function yMinMax() {
        yMin = d3.min(data, d => parseFloat(d[currentY]) * 0.9);
        yMax = d3.max(data, d => parseFloat(d[currentY]) * 1.10);
        console.log("In the end of YMinMax function")
    };

    // Update/Change upon axis option clicked
    function labelChange(axis, clickedText) {
        // Switch active to inactive
        d3.selectAll(".aText")
            .filter("." + axis)
            .classed("active", false)
            .classed("inactive", true)
        // switch the text just clicked to active
        clickedText
            .classed("inactive", false)
            .classed("active", true)
    };

    // Scatter plot X & Y axis computation
    xMinMax();
    yMinMax();
    
   // Create x Linear scale function above csv import
    var xScale = d3
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin]);

    // Create y scale function
    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin]);

    // Create initial scaled X and Y axis functions
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
     
    // Calculate X and Y tick counts
    function tickCount() {
        if (width <= 500) {
            xAxis.ticks(5);
            yAxis.ticks(5);
        } else {
            xAxis.ticks(10);
            yAxis.ticks(10);
        }
        console.log("In the end of TickCount function");
    }
    tickCount();

    // append x axis to the svg as group elements
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", 
        `translate(0,${(height - margin - labelArea)})`);

     // append y axis to the svg as group elements
    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", 
        `translate(${(margin + labelArea)},0)`);
    
    // Append the initial circles for each row of data
    var allCircles = svg.selectAll("allCircles")
    .data(data)
    .enter();
    allCircles
    .append("circle")
    // xScale figures the pixels
    .attr("cx", d => xScale(d[currentX]))
    .attr("cy", d => yScale(d[currentY]))
    .attr("r", circRadius)
    .attr("class", d => `stateCircle ${d.abbr}`)   
    .on("mouseover", function(d) {
            // Show tooltip when mouse is on circle
        toolTip.show(d, this);
            // Highlight circle border
        d3.select(this).style("stroke", "#323232");
        })
    .on("mouseout", function(d) {
            // Remove the tooltip
        toolTip.hide(d);
             // Remove the highlight
        d3.select(this).style("stroke", "#e3e3e3");
        });
    
    // Apply state text on circles (dx & dy are locations)
    allCircles
    .append("text")
    .text(d => d.abbr)
    .attr("dx", d => xScale(d[currentX]))
    // Push text to center by a 1/3
    .attr("dy", d => yScale(d[currentY]) + circRadius / 2.5)
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    .on("mouseover", d => {
        toolTip.show(d);
        d3.select(`.${d.abbr}`).style("stroke", "#323232");
    })
    .on("mouseout", d => {
        toolTip.hide(d);
        d3.select(`.${d.abbr}`).style("stroke", "#e3e3e3");
    });

// Dynamic graph on click
d3.selectAll(".aText").on("click", function() {
    var self = d3.select(this);
    if (self.classed("inactive")) {
        // Obtain name and axis saved in the label
        var axis = self.attr("data-axis");
        var name = self.attr("data-name");

        if (axis === "x") {
            currentX = name;
            // Update min and max of domain (x)
            xMinMax();
            xScale.domain([xMin, xMax]);
            svg.select(".xAxis").transition().duration(300).call(xAxis);
            
            // Update location of the circles
            d3.selectAll("circle").each(function() {
                d3.select(this)
                .transition()
                .attr("cx", function(d) {
                return xScale(d[currentX]);
                })
                .duration(300);
            });     

            d3.selectAll(".stateText").each(function() {
                d3
                .select(this)
                .transition()
                .attr("dx", function(d) {
                return xScale(d[currentX]);
                })
                .duration(300);      
                });
                 // Update
                labelChange(axis, self);
            }    
            // Update for Y axis selection  
            else {
                currentY = name;
                // Update min and max of range (y)
                yMinMax();
                yScale.domain([yMin, yMax]);
                svg.select(".yAxis").transition().duration(300).call(yAxis);
                // Update location of the circles
                d3.selectAll("circle").each(function() {
                    d3
                    .select(this)
                    .transition()
                    .attr("cy", d => yScale(d[currentY]))
                    .duration(300);
                });

                d3.selectAll(".stateText").each(function() {
                    d3
                    .select(this)
                    .transition()
                    // Center text
                    .attr("dy", d => yScale(d[currentY]) + circRadius / 3)
                    .duration(300);
                });
        // change the classes of to active and the clicked label
                labelChange(axis, self);
            }
        }
        console.log("In the end of Dynamic Graph on Click function");
    });

    d3.select(window).on("resize", resize);

    function resize() {
        width = parseInt(d3.select("#scatter").style("width"));
        height = width* 3/4;
        leftTextY = (height - labelArea) / 2;
        svg.attr("width", width).attr("height", height);
        xScale.range([margin + labelArea, width - margin]);
        yScale.range([height - margin - labelArea, margin]);

        svg.select(".xAxis")
        .call(xAxis)
        .attr("transform", `translate(0,${height - margin - labelArea})`);

        svg.select(".yAxis")
        .call(yAxis);
        tickCount();
        xLabelRefresh = () => {
            xLabel.attr(
                "transform",
                `translate(${((width - labelArea) / 2 + labelArea)},${(height - margin - padding)})`
            );
        };
        xLabelRefresh();
        // yLabelRefresh = () => {
        //     yLabel.attr(
        //         "transform",
        //         `translate(${leftTextX}, ${leftTextY})rotate(-90)`
        //     );
        // };
        // yLabelRefresh();
        adjustRadius();

        d3
        .selectAll("circle")
        .attr("cy", d => yScale(d[currentY]))
        .attr("cx", d => xScale(d[currentX]))
        .attr("r", circRadius);  

        d3
        .selectAll(".stateText")
        .attr("dy", d => yScale(d[currentY]) + circRadius / 3)
        .attr("dx", d => xScale(d[currentX]))
        .attr("r", circRadius / 3);
        console.log("In the end of Window Screen Resize function");
    }
})