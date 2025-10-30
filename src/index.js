import { SpaceX } from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)

const spaceX = new SpaceX();

const width = 640;
const height = 480;
const margin = { top: 20, right: 10, bottom: 40, left: 100 };

const svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


const projection = d3.geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([width / 2 - margin.left, height / 2]);

function setup() {
    spaceX.launches().then(launches => {
        const listContainer = document.getElementById("listContainer")
        renderLaunches(launches, listContainer);
        drawMap();
    }).catch(error => {
        alert(`Something went wrong:${error}`)
    }
    );
}

function renderLaunches(launches, container) {

    const list = document.createElement("ul");

    launches.forEach(launch => {
        const item = document.createElement("li");
        item.addEventListener("mouseenter", function (event) {
            if (event.target && event.target.tagName === 'LI') {
                d3.selectAll("circle")
                    .attr("fill", "red")
                    .attr("r", 4)
                d3.select(`circle[data-id="${event.target.dataset.pad}"]`)   
                    .attr("fill", "yellow")
                    .attr("r", 8);
            }
        });
        item.dataset.pad = launch.launchpad;
        item.innerHTML = launch.name;
        list.appendChild(item);
    })
    container.replaceChildren(list);
}

function highlight(point) {

}

function drawMap() {

    const projection = d3.geoMercator()
        .scale(70)
        .center([0, 20])
        .translate([width / 2 - margin.left, height / 2]);

    const colorScale = d3.scaleSequential(d3.interpolateBlues) // or any other color scheme
        .domain([0, 1]);

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
            return colorScale(1);
        })
        .style("opacity", .7)

        
    spaceX.launchpads().then(PadData => {
        svg.append("g")
            .selectAll("circle")
            .data(PadData)
            .enter()
            .append("circle")
            .attr("cx", d => projection([d.longitude, d.latitude])[0])
            .attr("cy", d => projection([d.longitude, d.latitude])[1])
            .attr("data-id", d => d.id)
            .attr("r", 4)
            .attr("fill", "red")
            .attr("stroke", "white")
            .attr("stroke-width", 1);

    }).catch(error => {
        alert(`Something went wrong:${error}`)
    }
    );
}