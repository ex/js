var data = [];
for (var k = 0; k < 100; k++) {
  var xx = (900 + 100 * Math.random()) * Math.cos(k * 2 * 3.14 / 100);
  var yy = (900 + 100 * Math.random()) * Math.sin(k * 2 * 3.14 / 100);  
  data.push({x: xx, y: yy, f: k * 65/ 100});
}

// Max value observed:
const max_x = d3.max(data, function(d) { return d.x; })
const min_x = d3.min(data, function(d) { return d.x; })

const max_y = d3.max(data, function(d) { return d.y; })
const min_y = d3.min(data, function(d) { return d.y; })

const max_f = d3.max(data, function(d) { return d.f; })
const min_f = d3.min(data, function(d) { return d.f; })

const margin = {top: 60, right: 60, bottom: 60, left: 60};
var width = 0;
var height = 0;

const sx = window.innerWidth - margin.left - margin.right;
const sy = window.innerHeight - margin.top - margin.bottom;

const dx = max_x - min_x;
const dy = max_y - min_y;

if (dy * sx / dx > sy) {
  height = sy;    
  width = dx * height / dy;
} else {
  width = sx;
  height = dy * width / dx;
}

const color = d3.scaleSequential()
    .domain([min_f, max_f])
    .interpolator(d3.interpolateCubehelixLong("red", "yellow"));    

// append the svg object to the body of the page
const svg = d3.select("#canvas")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
const x = d3.scaleLinear()
.domain([min_x, max_x])
.range([0, width]);

svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "axisColor")
    .call(d3.axisBottom(x));

// Add Y axis
const y = d3.scaleLinear()
    .domain([min_y, max_y])
    .range([ height, 0 ]);

svg.append("g")
    .attr("class", "axisColor")
    .call(d3.axisLeft(y));

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.x); } )
      .attr("cy", function (d) { return y(d.y); } )
      .attr("fill", function (d) { return color(d.f); } )
      .attr("r", 3)

