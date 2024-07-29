// tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

const margin = { top: 100, right: 100, bottom: 100, left: 100 };
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const x = d3.scaleLinear()
    .range([0, width]);

const y = d3.scaleLinear()
    .range([height, 0]);

const svg = d3.select("#line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("data/1976-2020-president.csv").then(function (data) {
    data.forEach(d => {
        d.year = +d.year;
        d.candidatevotes = +d.candidatevotes;
    });

    const updateChart = (state) => {
        const stateDem = data.filter(d => d.state_po === state && d.party_simplified === "DEMOCRAT");
        const stateRep = data.filter(d => d.state_po === state && d.party_simplified === "REPUBLICAN");

        if (stateDem.length === 0 && stateRep.length === 0) {
            alert("Invalid Postal Code");
            return;
        }

        let maxVotes = d3.max(stateDem, d => d.candidatevotes);
        let maxVotesRep = d3.max(stateRep, d => d.candidatevotes);
        if (maxVotes < maxVotesRep) {
            maxVotes = maxVotesRep;
        }

        x.domain(d3.extent(data, d => d.year));
        y.domain([0, maxVotes + 100000]);

        const tickValues = d3.range(1976, d3.max(data, d => d.year) + 1, 4);

        // clear previous
        svg.selectAll("*").remove();

        // draw gridlines and axes
        // x-axis
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x)
                .tickValues(tickValues)
                .tickSize(-height)
                .tickFormat(''))
            .selectAll("path, line")
            .style("stroke", "#ddd")
            .style("stroke-width", "1px");

        // y-axis
        svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat(''))
            .selectAll("path, line")
            .style("stroke", "#ddd")
            .style("stroke-width", "1px");

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x)
                .tickValues(tickValues)
                .tickFormat(d3.format("d")))
            .selectAll("path, line")
            .style("stroke", "#ddd");

        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("path, line")
            .style("stroke", "#ddd");

        // create lines
        const lineDem = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.candidatevotes));

        const lineRep = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.candidatevotes));

        // draw the lines
        svg.append("path")
            .datum(stateDem)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1)
            .attr("d", lineDem);

        svg.append("path")
            .datum(stateRep)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1)
            .attr("d", lineRep);

        // dots for stateDem
        svg.selectAll(".dotDem")
            .data(stateDem)
            .enter().append("circle")
            .attr("class", "dotDem")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.candidatevotes))
            .attr("r", 3)
            .attr("fill", "blue")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html(`Year: ${d.year}<br>Votes: ${d.candidatevotes}<br>Name: ${d.candidate}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px");
            })
            .on("mouseout", d => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // dots for stateRep
        svg.selectAll(".dotRep")
            .data(stateRep)
            .enter().append("circle")
            .attr("class", "dotRep")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.candidatevotes))
            .attr("r", 3)
            .attr("fill", "red")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html(`Year: ${d.year}<br>Votes: ${d.candidatevotes}<br>Name: ${d.candidate}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px");
            })
            .on("mouseout", d => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        // chart title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-family", "Arial")
            .style("font-size", "24px")
            .text(state + " Presidential Candidate Votes Over Time");
        
        // x-axis title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom / 1.5)
            .attr("text-anchor", "middle")
            .style("font-family", "Arial")
            .style("font-size", "12px")
            .text("Election Year");
        
        // y-axis title
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left / 1.5)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .style("font-family", "Arial")
            .style("font-size", "12px")
            .text("Presidential Candidate Votes");
    };

    // set initial state to IL
    updateChart("IL");

    // update chart on button click
    d3.select("#updateButton").on("click", function () {
        const stateInput = d3.select("#stateInput").property("value").toUpperCase();
        updateChart(stateInput);
    });
});
