d3.json("data/states-albers-10m.json").then(us => {
    d3.csv("data/1976-2020-president-with-winners.csv").then(electoralData => {
        d3.csv("data/1976-2020-president-with-popular-vote.csv").then(popularVoteData => {

            // need to use sizes given by topojson source
            const mapSvg = d3.select("#map").append("svg")
                .attr("width", 975)
                .attr("height", 610);

            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip");

            const updateMap = (year) => {

                const yearData = electoralData.filter(d => d.year == year);
                const yearPopularVoteData = popularVoteData.filter(d => d.year == year)[0];

                const stateById = {};

                yearData.forEach(d => {
                    stateById[parseInt(d.state_fips)] = d.winning_party;
                });

                const states = topojson.feature(us, us.objects.states).features;

                mapSvg.selectAll("*").remove();

                mapSvg.append("g")
                    .selectAll("path")
                    .data(states)
                    .enter().append("path")
                    .attr("d", d3.geoPath())
                    .attr("fill", d => {
                        const winner = stateById[parseInt(d.id)];
                        return winner === "DEMOCRAT" ? "blue" : "red";
                    })
                    .style("stroke", "#fff")
                    .style("stroke-width", "1")
                    .on("mouseover", (event, d) => {
                        const stateId = parseInt(d.id);
                        const winner = stateById[stateId] || "Unknown";
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 1);
                        tooltip.html(`State: ${d.properties.name}<br>Winning Party: ${winner}`)
                            .style("visibility", "visible");
                    })
                    .on("mousemove", (event) => {
                        tooltip.style("top", (event.pageY) + "px")
                            .style("left", (event.pageX) + "px");
                    })
                    .on("mouseout", () => {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });

                mapSvg.append("text")
                    .attr("x", 480)
                    .attr("y", 20)
                    .attr("text-anchor", "middle")
                    .style("font-family", "Arial")
                    .style("font-size", "16px")
                    .text(`Electoral College Map - ${year}`);

                mapSvg.append("text")
                    .attr("x", 480)
                    .attr("y", 40)
                    .attr("text-anchor", "middle")
                    .style("font-family", "Arial")
                    .style("font-size", "14px")
                    .text(`Winner: ${yearPopularVoteData.winning_candidate} - ${yearPopularVoteData.winning_party}`);
            };

            updateMap(2020);

            d3.select("#updateButton").on("click", () => {
                const yearInput = d3.select("#yearInput").property("value");
                updateMap(yearInput);
            });
        });
    });
});
