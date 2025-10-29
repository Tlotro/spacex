import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)

function setup(){
    const spaceX = new SpaceX();
    spaceX.launches().then(data=>{
        const listContainer = document.getElementById("listContainer")
        PadData = data;
        renderLaunches(data, listContainer);
        drawMap();
    }).catch(error=>
    {
        alert(`Something went wrong:${error}`)
    }
    );
}

function renderLaunches(launches, container){
    const list = document.createElement("ul");
    list.addEventListener('mouseover', function(event){
        if (event.target.tagName === 'LI') {
            let pad = spaceX.launchpad(event.target.dataset.pad)

            d3.selectAll("circle")
            .attr("fill", "red")
            .attr("r", 4)
            .filter(function() {
                const circle = d3.select(this);
                const cx = +circle.attr("cx");
                const cy = +circle.attr("cy");
            
                return Math.abs(cx - projection([pad.longitude, pad.latitude])[0]) < 0.1 && Math.abs(cy - projection([pad.longitude, pad.latitude])[1]) < 0.1;
            })
            .attr("fill", "yellow")
            .attr("r", 8);
        }
    });

    launches.forEach(launch=>{
        const item = document.createElement("li");
        item.dataset.pad = launch.launchpad;
        item.innerHTML = launch.name;
        list.appendChild(item);
    })
    container.replaceChildren(list);
}

function highlight(point)
{
    
}

function drawMap(){
    const width = 640;
    const height = 480;
    const margin = {top: 20, right: 10, bottom: 40, left: 100};

    const svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const projection = d3.geoMercator()
        .scale(70)
        .center([0,20])
        .translate([width / 2 - margin.left, height / 2]);

    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("fill", function (d) {
            return colorScale(0);
        })
        .style("opacity", .7)

    let PadData = SpaceX.launchpads()

    svg.append("g")
        .selectAll("circle")
        .data(PadData)
        .enter()
        .append("circle")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", 5)
        .attr("fill", "red")
        .attr("stroke", "white")
        .attr("stroke-width", 1);
}
