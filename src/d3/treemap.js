// Import Observable runtime and the @d3/color-legend notebook
import d3_colorLegend from 'https://api.observablehq.com/@d3/color-legend.js?v=3';
import {Runtime} from 'https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js';

async function renderSwatches(el) {
  const color =
      d3.scaleOrdinal().domain(gData.legend).range(d3.schemeSpectral[10]);
  const margin = ({top: 20, right: 30, bottom: 30, left: 5})

  // Get the value of the "swatches" notebook cell, which is the function we
  // want, which returns a DOM element
  const module = new Runtime().module(d3_colorLegend);
  const swatches = await module.value('swatches');

  // Finally, call `swatches` with our options and append it to the container
  const element = swatches({color, marginLeft: margin.left, columns: '200px'});
  el.appendChild(element);
}

var gCount = 0;
function uid(name) {
  return new Id('O-' + (name == null ? '' : name + '-') + ++gCount);
}
function Id(id) {
  this.id = id;
  this.href = new URL(`#${id}`, location) + '';
}
Id.prototype.toString = function() {
  return 'url(' + this.href + ')';
};

function createTreemap(data) {
  const width = 930;
  const height = 930;

  const color =
      d3.scaleOrdinal(data.children.map(d => d.name), d3.schemeSpectral[10]);

  const root = d3.treemap()
                   .tile(d3.treemapBinary)
                   //  .tile(d3.treemapSliceDice)
                   .size([width, height])
                   .padding(0)(d3.hierarchy(data)
                                   .sum(d => d.value)
                                   .sort((a, b) => b.value - a.value));

  // Create the SVG container.
  const svg =
      d3.select('body')
          .append('svg')
          .attr('viewBox', [0, 0, width, height])
          .attr('width', width)
          .attr('height', height)
          .attr('class', 'nodeLabel')
          .attr(
              'style', 'max-width: 100%; height: auto; font: 11px sans-serif;');

  // Add a cell for each leaf of the hierarchy.
  const leaf = svg.selectAll('g')
                   .data(root.leaves())
                   .join('g')
                   .attr('transform', d => `translate(${d.x0},${d.y0})`);

  // Append a tooltip.
  const format = d3.format(',d');
  leaf.append('title').text(d => {
    return d.parent.data.name + '\n' + d.data.name[0] + '\n' + format(d.value);
  });

  // Append a color rectangle.
  leaf.append('rect')
      .attr('id', d => (d.leafUid = uid('leaf')).id)
      .attr(
          'fill',
          d => {
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);
          })
      .attr('fill-opacity', 1.0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0);

  // Append a clipPath to ensure text does not overflow.
  leaf.append('clipPath')
      .attr('id', d => (d.clipUid = uid('clip')).id)
      .append('use')
      .attr('xlink:href', d => d.leafUid.href);

  // Append multiline text. The last line shows the value and has a specific
  // formatting.
  leaf.append('text')
      .attr('clip-path', d => d.clipUid)
      .selectAll('tspan')
      .data(d => d.data.name[1].split(/_|\s+/g).concat(format(d.data.value)))
      .join('tspan')
      .attr('x', 3)
      .attr(
          'y',
          (d, i, nodes) =>
              `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
      .text(d => d);
}

renderSwatches(document.querySelector('.container'));
createTreemap(gData);
