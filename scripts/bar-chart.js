d3.csv("data/1976-2020-president-with-popular-vote.csv").then(data => {
    function updateChart(year) {

        const winningObject = data.find(d => (d.year === year && d.winning_candidate) && (d.candidate === d.winning_candidate && d.party_simplified === d.winning_party));
        console.log(winningObject);

        const filteredData = data.filter(d => d.year === year &&
            (d.party_simplified === "DEMOCRAT" || d.party_simplified === "REPUBLICAN"));

        const margin = { top: 100, right: 100, bottom: 100, left: 100 },
            width = 400 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        d3.select("#bar-chart").selectAll("*").remove();

        const svg = d3.select("#bar-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(filteredData.map(d => d.candidate))
            .padding(0.1);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        const y = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => +d.candidatevotes)])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // div for tool tip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "#f4f4f4")
            .style("padding", "5px")
            .style("border", "1px solid #d4d4d4")
            .style("border-radius", "4px");

        // plot bars
        svg.selectAll("mybar")
            .data(filteredData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.candidate))
            .attr("y", d => y(d.candidatevotes))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.candidatevotes))
            .attr("fill", d => d.party_simplified === "DEMOCRAT" ? "blue" : "red")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html(`Candidate: ${d.candidate}<br>Votes: ${d.candidatevotes}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(`${year} Presidential Election - Popular Vote`);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 30)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Popular Vote");

        // considerations for 200 and 2016
        if (year === "2000" || year === "2016") {
            svg.append("text")
            .attr("x", x(winningObject.winning_candidate) + x.bandwidth() / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "black")
            .html(`Winner: ${winningObject.winning_candidate} (without majority)`);
        } else {
            svg.append("text")
            .attr("x", x(winningObject.winning_candidate) + x.bandwidth() / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "black")
            .text(`Winner: ${winningObject.winning_candidate}`);
        }
    }

    updateChart("2020");

    d3.select("#updateButton").on("click", () => {
        const yearInput = d3.select("#yearInput").property("value");
        updateChart(yearInput);
    });
});
