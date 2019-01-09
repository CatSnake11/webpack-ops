import * as React from 'react';
import * as d3 from 'd3';
import { observer, inject } from 'mobx-react'
import { StoreType } from '../store'
import { ipcRenderer } from 'electron';
import ChartButtons from './ChartButtons';
import AwesomeComponent from './AwesomeComponent';
import { node } from 'prop-types';

type Props = {
  store?: StoreType
}

const initialState = {
  isPackageSelected: false,
  width: 550,
  height: 550,
  data: {
    "name": "A1",
    "children": [
      {
        "name": "B1",
        "children": [
          {
            "name": "C1",
            "value": 220
          },
          {
            "name": "C2",
            "value": 300
          },
          {
            "name": "C3",
            "children": [
              {
                "name": "D1",
                "children": [
                  {
                    "name": "E1",
                    "value": 1000
                  },
                  {
                    "name": "E2",
                    "value": 100
                  }
                ]
              },
              {
                "name": "D2",
                "value": 40
              }
            ]
          }
        ]
      },
      {
        "name": "B2",
        "value": 200
      }
    ]
  }
}

type StateType = Readonly<typeof initialState>
@inject('store')
@observer
export default class Home extends React.Component<Props, StateType> {
  // may need "readonly"
  state: StateType = initialState

  componentDidMount() {
    ipcRenderer.on('display-stats-reply', (event: any, data: string[][]): void => {
      console.log(data)

      let root: any = { "name": "root", "children": [] };
      for (let i: number = 0; i < data.length; i++) {
        let sequence: string = data[i][0];
        let size: number = +data[i][1];
        if (isNaN(size)) { // e.g. if this is a header row
          continue;
        }
        let parts: string[] = sequence.split("/");
        let currentNode = root;
        for (let j: number = 0; j < parts.length; j++) {
          let children = currentNode["children"];
          let nodeName = parts[j];
          let childNode;
          if (j + 1 < parts.length) {
            // Not yet at the end of the sequence; move down the tree.
            var foundChild = false;
            for (var k = 0; k < children.length; k++) {
              if (children[k]["name"] == nodeName) {
                childNode = children[k];
                foundChild = true;
                break;
              }
            }
            // If we don't already have a child node for this branch, create it.
            if (!foundChild) {
              childNode = { "name": nodeName, "children": [] };
              children.push(childNode);
            }
            currentNode = childNode;
          } else {
            // Reached the end of the sequence; create a leaf node.
            childNode = { "name": nodeName, "value": size };
            children.push(childNode);
          }
        }
      }
      this.doSetBeforeRoot(root);
      // console.log(root)
      // console.log(this.state.data)
      this.drawChart(this.props.store.beforeRoot);
      this.drawZoom(this.props.store.beforeRoot);
      this.drawTreemap(this.props.store.beforeRoot);
      this.drawTreemapZoom(this.props.store.beforeRoot);
      this.doSetDisplaySunburst();
      this.props.store.setWereChartsEverDrawn();
    })

    ipcRenderer.on('choose-config', (event: any, arg: any): void => {
      console.log("list of configs - pick one")
      this.props.store.setDisplayConfigSelectionTrue();
      console.log(arg)
    })

    if (this.props.store.wereChartsEverDrawn) {
      this.drawChart(this.props.store.beforeRoot);
      this.drawZoom(this.props.store.beforeRoot);
      this.drawTreemap(this.props.store.beforeRoot);
      this.drawTreemapZoom(this.props.store.beforeRoot);
      this.doSetDisplaySunburst();
    }
  }

  private drawChart(jsonData: any) {
    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
    var _self = this;
    const b = {
      w: 75, h: 30, s: 3, t: 10
    };

    const radius = (Math.min(this.state.width, this.state.height) / 2) - 10;

    const root = d3.hierarchy(jsonData);

    const sunburstLayout = d3.partition();

    sunburstLayout.size([2 * Math.PI, radius]);
    const arc: any = d3.arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0 * 1.5)
      .outerRadius((d) => d.y1 * 1.5)

    const initializeBreadcrumbTrail = () => {
      // Add the svg area.
      var trail = d3.select("#sequence").append("svg:svg")
        .attr("width", 800)
        .attr("height", 50)
        .attr("id", "trail");

      // Add the label at the end, for the percentage.
      trail.append("svg:text")
        .attr("id", "endlabel")
        .style("fill", "#44505d");   //controls the color of the percentage
    }

    initializeBreadcrumbTrail();

    root.sum(d => d.value)
      .sort(function (a, b) { return b.value - a.value; });

    sunburstLayout(root);

    const main = d3.select('.sunburst')
      .attr("width", 550)
      .attr("height", 550)
      .append("svg:g")
      .attr("id", "container")
      .attr("transform", "translate(" + this.state.width / 2 + "," + this.state.height / 2 + ")");

    main.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

    let nodes = sunburstLayout(root).descendants()
      .filter(function (d: any) {
        return (d.x1 - d.x0 > 0.0092); // 0.005 radians = 0.29 degrees
      });

    let color = function () {
      let ctr = 0;
      const hex = ['#8cc4d9', '#64b0cc', '#409dbf', '#337e99', '#265e73', '#193f4d']
      // const hex = ['#cbedef', '#b6e7ed', '#9befee', '#d3e6e8', '#7df2ec', '#cdf2e4']
      return function () {
        if (ctr === hex.length - 1) {
          ctr = 0;
          return hex[ctr]
        } else {
          ctr++
          return hex[ctr]
        }
      }
    }
    let loopColors = color()

    let i = 0;
    const path = main.data([jsonData]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function (d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function (d) { return loopColors() })
      .style("opacity", 1)
      .on("mouseover", mouseover)

    let totalSize = path.datum().value;
    console.log(totalSize)


    function mouseover(d) {
      var percentage = (100 * d.value / totalSize).toPrecision(3);
      var percentageString = percentage + "%";
      if (Number(percentage) < 0.1) {
        percentageString = "< 0.1%";
      }

      d3.select("#percentage")
        .text('% of Total: ' + percentageString);
      //ADDED FILE NAME
      d3.select("#filename")
        .text(d.data.name)

      //ADDED FILE SIZE
      d3.select("#filesize")
        .text('Size: ' + d.value / 1000 + 'kb')

      d3.select("#explanation")
        .style("visibility", "");

      var sequenceArray = d.ancestors().reverse();
      sequenceArray.shift(); // remove root node from the array
      let trickArray = sequenceArray.slice(0);
      // convert path array to a '/' seperated path string. add '/' at the end if it's a directory.

      for (var i = 1; i < trickArray.length + 1; i++) {
        updateBreadcrumbs(trickArray.slice(0, i), percentageString);
      }
      // Fade all the segments.
      d3.selectAll("#chart").selectAll("path")
        .style("opacity", 0.3);

      // Then highlight only those that are an ancestor of the current segment.
      main.selectAll("path")
        .filter(function (node) {
          return (sequenceArray.indexOf(node) >= 0);
        })
        .style("opacity", 1);

      // Update the breadcrumb trail to show the current sequence and percentage.
      function updateBreadcrumbs(nodeArray: any, percentageString: any) {

        // Data join; key function combines name and depth (= position in sequence).
        var trail = d3.select("#trail")
          .selectAll("g")
          .data(nodeArray, function (d: any) { return d.data.name + d.depth; });

        // Remove exiting nodes.
        trail.exit().remove();

        // Add breadcrumb and label for entering nodes.
        var entering = trail.enter().append("svg:g");

        entering.append("svg:polygon")
          .attr("points", breadcrumbPoints)
          .style("fill", function (d) { return '#f7aab2'; })

        entering.append("svg:text")
          .attr("x", (b.w + b.t) / 2)
          .attr("y", b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "start")
          .text(function (d) { return d.data.name; });

        // Now move and update the percentage at the end.
        var nodeAryFlat = '';

        for (var i = 0; i < nodeArray.length; i++) {
          nodeAryFlat = nodeAryFlat + ' ' + nodeArray[i].data.name
        }

        var nodeAryFlatLength = 0;
        var nodeAryFlatLengthPercentage = 0;
        for (var i = 1; i < nodeArray.length; i++) {
          nodeAryFlatLength = nodeAryFlatLength + b.w + nodeArray[i - 1].data.name.length * 7.5 + b.t
          nodeAryFlatLengthPercentage = nodeAryFlatLength + b.w + nodeArray[i].data.name.length * 7.5 + b.t + 15
        }

        entering.attr("transform", function (d, i) {
          if (i === 0) {
            return "translate(0, 0)"
          } else {
            return "translate(" + nodeAryFlatLength + ", 0)";   //POSITIONING OF WORDS
          }
        });

        d3.select("#trail").select("#endlabel")
          .attr("x", (nodeAryFlatLengthPercentage))  //CONTROLS WHERE THE PERCENTAGE IS LOCATED
          .attr("y", b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "start")
          .text(percentageString)

        // Make the breadcrumb trail visible, if it's hidden.
        d3.select("#trail")
          .style("visibility", "");
      }

      // Generate a string that describes the points of a breadcrumb polygon.
      function breadcrumbPoints(d: any, i: any) {
        var points = [];
        points.push("0,0");
        points.push(b.w + d.data.name.length * 7.5 + ",0");  //CONTROLS THE SHAPE OF THE POLYGON
        points.push(b.w + d.data.name.length * 7.5 + b.t + "," + (b.h / 2));
        points.push(b.w + d.data.name.length * 7.5 + "," + b.h);
        points.push("0," + b.h);
        if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
          points.push(b.t + "," + (b.h / 2));
        }
        return points.join(" ");
      }
    }

    // Restore everything to full opacity when moving off the visualization.
    const mouseleave = () => {

      // Hide the breadcrumb trail
      d3.select("#trail")
        .style("visibility", "hidden");

      // Deactivate all segments during transition.
      d3.selectAll("path").on("mouseover", null);

      // Transition each segment to full opacity and then reactivate it.
      d3.selectAll("#chart").selectAll("path")
        .transition()
        .duration(600)
        .style("opacity", 1)
        .on("end", function () {
          d3.select(this).on("mouseover", mouseover);
        });

      d3.select("#explanation")
        .style("visibility", "hidden");

      // _self.props.onHover(null);
    }

    d3.select("#container").on("mouseleave", mouseleave);
  }


  //////////////////////////////////////////////////////////////////////////////////////////////////


  private drawZoom(jsonData: any) {
    const width = 550,
      height = 550,
      maxRadius = (Math.min(width, height) / 2) - 5;

    const formatNumber = d3.format(',d');

    const x = d3
      .scaleLinear()
      .range([0, 2 * Math.PI])
      .clamp(true);

    const y = d3.scaleSqrt().range([maxRadius * 0.1, maxRadius]);

    // sunlight style guide network colors

    const dark = [
      '#B08B12',
      '#BA5F06',
      '#8C3B00',
      '#6D191B',
      '#842854',
      '#5F7186',
      '#193556',
      '#137B80',
      '#144847',
      '#254E00'
    ];

    const mid = [
      '#E3BA22',
      '#E58429',
      '#BD2D28',
      '#D15A86',
      '#8E6C8A',
      '#6B99A1',
      '#42A5B3',
      '#0F8C79',
      '#6BBBA1',
      '#489d82'
    ];

    const light = [
      '#F2DA57',
      '#F6B656',
      '#E25A42',
      '#DCBDCF',
      '#B396AD',
      '#B0CBDB',
      '#33B6D0',
      '#7ABFCC',
      '#C8D7A1',
      '#489d82'
    ];

    const palettes = [light, mid, dark];
    const lightGreenFirstPalette = palettes
      .map(d => d.reverse())
      .reduce((a, b) => a.concat(b));

    const color = d3.scaleOrdinal(lightGreenFirstPalette);

    const partition = d3.partition();

    const arc = d3
      .arc()
      .startAngle(d => x(d.x0))
      .endAngle(d => x(d.x1))
      .innerRadius(d => y(Math.max(0, d.y0)))
      .outerRadius(d => y(Math.max(0, d.y1)));

    const initializeBreadcrumbTrail = () => {
      // Add the svg area.
      var trail3 = d3.select("#sequence3").append("svg:svg")
        .attr("width", 800)
        .attr("height", 50)
        .attr("id", "trail3");

      // Add the label at the end, for the percentage.
      trail3.append("svg:text")
        .attr("id", "endlabel")
        .style("fill", "#fff");   //controls the color of the percentage
    }

    initializeBreadcrumbTrail();

    const middleArcLine = d => {
      const halfPi = Math.PI / 2;
      const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
      const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

      const middleAngle = (angles[1] + angles[0]) / 2;
      const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
      if (invertDirection) {
        angles.reverse();
      }

      const path = d3.path();
      path.arc(0, 0, r, angles[0], angles[1], invertDirection);
      return path.toString();
    };

    const textFits = d => {
      const CHAR_SPACE = 10;

      const deltaAngle = x(d.x1) - x(d.x0);
      const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
      const perimeter = r * deltaAngle;

      return d.data.name.length * CHAR_SPACE < perimeter;
    };

    const svg = d3
      // .select('body')
      .select('#zoomContainer')
      .append('svg')
      // .style('width', '100vw')
      // .style('height', '100vh')
      .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
      .on('click', () => focusOn()) // Reset zoom on canvas click
      .attr('id', 'viewBox');

    const root = d3.hierarchy(jsonData);
    root.sum(d => d.value)
      .sort(function (a, b) { return b.value - a.value; });


    const slice = svg.selectAll('g.slice').data(partition(root).descendants());

    slice.exit().remove();
    let path1 = d3.selectAll('g').data(root.descendants())
    let totalSize = path1.datum().value;

    const newSlice = slice
      .enter()
      .append('g')
      .attr('class', 'slice')
      .on('click', d => {
        d3.event.stopPropagation();
        focusOn(d);
      });

    newSlice
      .append('title')
      .text(d => d.data.name + '\n' + formatNumber(d.value) + '\n' + 'Of Total Size: ' +
        ((d.value / totalSize) * 100).toPrecision(3) + '%');

    newSlice
      .append('path')
      .attr('class', 'main-arc')
      .style('fill', d => color((d.children ? d : d.parent).data.name))
      .attr('d', arc);

    newSlice
      .append('path')
      .attr('class', 'hidden-arc')
      .attr('id', (_, i) => `hiddenArc${i}`)
      .attr('d', middleArcLine);

    const text = newSlice
      .append('text')
      .attr('display', d => (textFits(d) ? null : 'none'));

    text
      .append('textPath')
      .attr('startOffset', '50%')
      .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
      .text(d => d.data.name);

    function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
      // Reset to top-level if no data point specified

      const transition = svg
        .transition()
        .duration(750)
        .tween('scale', () => {
          const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]);
          return t => {
            x.domain(xd(t));
            y.domain(yd(t));
          };
        });

      transition.selectAll('path.main-arc').attrTween('d', d => () => arc(d));

      transition
        .selectAll('path.hidden-arc')
        .attrTween('d', d => () => middleArcLine(d));

      transition
        .selectAll('text')
        .attrTween('display', d => () => (textFits(d) ? null : 'none'));

      moveStackToFront(d);

      function moveStackToFront(elD) {
        svg
          .selectAll('.slice')
          .filter(d => d === elD)
          .each(function (d) {
            this.parentNode.appendChild(this);
            if (d.parent) {
              moveStackToFront(d.parent);
            }
          });
      }
    }

  }


  //////////////////////////////////////////////////////////////////////////////////////////////////


  private drawTreemap(jsonData: any) {
    var _self = this;
    const b = {
      w: 75, h: 30, s: 3, t: 10
    };

    const root = d3.hierarchy(jsonData);
    const treemapLayout = d3.treemap();

    treemapLayout
      .size([600, 450])

    root.sum(function (d: any) {
      return d.value;
    });

    treemapLayout(root);

    const initializeBreadcrumbTrail = () => {
      // Add the svg area.
      var trail2 = d3.select("#sequenceTreeMap").append("svg:svg")
        .attr("width", this.state.width)
        .attr("height", 50)
        .attr("id", "trail2");

      // Add the label at the end, for the percentage.
      trail2.append("svg:text")
        .attr("id", "endlabel")
        .style("fill", "#fff");   //controls the color of the percentage
    }

    initializeBreadcrumbTrail();

    const nodes = d3.select('#treemap')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', function (d: any) { return 'translate(' + [d.x0, d.y0] + ')' })
      .attr("fill", 'rgba(85, 183, 208, 0.2)')
      .on('mouseover', mouseoverTreemap)
      .on('mouseout', mouseoutTreemap);

    nodes
      .append('title')
      .text(d => d.data.name + '\n' + d.value + '\n');

    let totalSize = nodes.datum().value;
    function mouseoutTreemap(d: any): void {
      d3.select(this)
        .attr("fill", 'rgba(85, 183, 208, 0.2)')
    }
    function mouseoverTreemap(d: any): void {
      let percentage: number = (100 * d.value / totalSize)
      let percentageString: string = ""
      if (percentage < 0.1) {
        percentageString = "< 0.1%";
      } else percentageString = percentage.toPrecision(3) + '%';
      d3.select('#treemapText')
        .text(d.data.name)

      d3.select('#percentageTree')
        .text(percentageString)

      d3.select('#filesizeTree')
        .text(`Size: ${d.value / 1000} kb`)

      d3.select('#explanationTree')
        .style('visibility', '');


      d3.select(this)
        .attr("fill", 'rgba(10, 0, 218, 0.2)')

      const ancestorsArray = d.ancestors().reverse()
      ancestorsArray.shift();

      let trickArray2 = ancestorsArray.slice(0);

      for (var i = 1; i < trickArray2.length + 1; i++) {
        updateBreadcrumbs(trickArray2.slice(0, i), percentageString);
      }

      const ancestorsNameArray = ancestorsArray.map(el => {
        return el.data.name;
      })

      d3.select('#ancestors')
        .text(ancestorsNameArray.join("/"));
    }

    function updateBreadcrumbs(nodeArray: any, percentageString: any) {

      // Data join; key function combines name and depth (= position in sequence).
      var trail = d3.select("#trail2")
        .selectAll("g")
        .data(nodeArray, function (d: any) { return d.data.name + d.depth; });

      // Remove exiting nodes.
      trail.exit().remove();

      // Add breadcrumb and label for entering nodes.
      var entering = trail.enter().append("svg:g");

      entering.append("svg:polygon")
        .attr("points", breadcrumbPoints)
        .style("fill", function (d) { return '#409dbf'; });

      entering.append("svg:text")
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(function (d) { return d.data.name; });

      // Now move and update the percentage at the end.
      var nodeAryFlat = '';

      for (var i = 0; i < nodeArray.length; i++) {
        nodeAryFlat = nodeAryFlat + ' ' + nodeArray[i].data.name
      }

      var nodeAryFlatLength = 0;
      var nodeAryFlatLengthPercentage = 0;
      for (var i = 1; i < nodeArray.length; i++) {
        nodeAryFlatLength = nodeAryFlatLength + b.w + nodeArray[i - 1].data.name.length * 7.5 + b.t
        nodeAryFlatLengthPercentage = nodeAryFlatLength + b.w + nodeArray[i].data.name.length * 7.5 + b.t + 15
      }

      entering.attr("transform", function (d, i) {
        if (i === 0) {
          return "translate(0, 0)"
        } else {
          return "translate(" + nodeAryFlatLength + ", 0)";   //POSITIONING OF WORDS
        }
      });

      d3.select("#trail2").select("#endlabel")
        .attr("x", (nodeAryFlatLengthPercentage))  //CONTROLS WHERE THE PERCENTAGE IS LOCATED
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(percentageString);

      // Make the breadcrumb trail visible, if it's hidden.
      d3.select("#trail2")
        .style("visibility", "");
    }

    // Generate a string that describes the points of a breadcrumb polygon.
    function breadcrumbPoints(d: any, i: any) {
      var points = [];
      points.push("0,0");
      points.push(b.w + d.data.name.length * 7.5 + ",0");  //CONTROLS THE SHAPE OF THE POLYGON
      points.push(b.w + d.data.name.length * 7.5 + b.t + "," + (b.h / 2));
      points.push(b.w + d.data.name.length * 7.5 + "," + b.h);
      points.push("0," + b.h);
      if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
        points.push(b.t + "," + (b.h / 2));
      }
      return points.join(" ");
    }

    nodes
      .append('rect')
      .attr('width', function (d: any) { return d.x1 - d.x0; })
      .attr('height', function (d: any) { return d.y1 - d.y0; })
      .style('stroke', '#FFFFFF')

    treemapLayout.tile(d3.treemapDice);
  }


  private drawTreemapZoom(jsonData: any) {

    const x = d3.scaleLinear().domain([0, 100]).range([0, 100])
    const y = d3.scaleLinear().domain([0, 100]).range([0, 100])

    const color = d3.scaleOrdinal()
      .range(d3.schemeDark2
        .map(function (c) {
          c = d3.rgb(c);
          //c.opacity = 0.5; 
          return c;
        })
      )

    const treemap = d3.treemap()
      .size([100, 100])
      .paddingInner(0)
      .round(false) //true

    const nodes = d3.hierarchy(jsonData)
      .sum(function (d) { return d.value ? 1 : 0; })

    let currentDepth;

    treemap(nodes);

    var chart = d3.select("#chartTreeMapZoom");
    var cells = chart
      .selectAll(".nodeTZ")
      .data(nodes.descendants())
      .enter()
      .append("div")
      .attr("class", (d: any) => "nodeTZ level-" + d.depth)
      .attr("title", (d: any) => d.data.name ? d.data.name : "null");

    cells
      .style("left", (d: any) => x(d.x0) + "%")
      .style("top", (d: any) => y(d.y0) + "%")
      .style("width", (d: any) => x(d.x1) - x(d.x0) + "%")
      .style("height", (d: any) => y(d.y1) - y(d.y0) + "%")
      .style("background-color", function (d) { while (d.depth > 2) d = d.parent; return color(d.data.name) })
      .on("click", zoom)
      .append("p")
      .attr("class", "label")
      .text(function (d: any) { return d.data.name ? d.data.name : "---"; });

    var parent = d3.select(".up")
      .datum(nodes)
      .on("click", zoom);

    function zoom(d) {

      console.log('clicked: ' + d.data.name + ', depth: ' + d.depth);

      currentDepth = d.depth;
      parent.datum(d.parent || nodes);

      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);

      var t = d3.transition()
        .duration(400)
        .ease(d3.easeCubicOut);

      cells
        .transition(t)
        .style("left", function (d) { return x(d.x0) + "%"; })
        .style("top", function (d) { return y(d.y0) + "%"; })
        .style("width", function (d) { return x(d.x1) - x(d.x0) + "%"; })
        .style("height", function (d) { return y(d.y1) - y(d.y0) + "%"; });

      cells // hide this depth and above
        .filter(function (d) { return d.ancestors(); })
        .classed("hide", function (d) { return d.children ? true : false });

      cells // show this depth + 1 and below
        .filter(function (d) { return d.depth > currentDepth; })
        .classed("hide", false);
    }

    treemap.tile(d3.treemapDice);
  }


  handleDrawChart = (arg): void => {
    this.drawChart(arg);
  }

  handleDrawTreeMap = (arg: any): void => {
    this.drawTreemap(arg);
  }

  doSetBeforeRoot = (root: any): void => {
    this.props.store.setBeforeRoot(root);
  }

  doSetDisplaySunburst = (): void => {
    this.props.store.setDisplaySunburst();
  }

  doSetDisplaySunburstZoom = (): void => {
    this.props.store.setDisplaySunburstZoom();
  }
  doSetDisplayTreemap = (): void => {
    this.props.store.setDisplayTreemap();
  }
  doSetDisplayTreemapZoom = (): void => {
    this.props.store.setDisplayTreemapZoom();
  }

  doSetIsLoadingTrue = (): void => {
    this.props.store.setIsLoadingTrue();
  }

  getPackageJson = (): void => {
    ipcRenderer.send('load-package.json', 'ping');
    this.props.store.setIsPackageSelectedTrue();
    this.doSetIsLoadingTrue();
  }

  doSetDisplayConfigSelectionFalse = (): void => {
    this.props.store.setDisplayConfigSelectionFalse();
  }

  doSetLoadStatsFalse = (): void => {
    this.props.store.setLoadStatsFalse();
  }

  getWebpackConfig = (event: any): void => {
    console.log("getWebpackConfig")   //getting this far
    let radios = document.getElementsByName("config")// as HTMLInputElement

    for (var i = 0, length = radios.length; i < length; i++) {
      if ((radios[i] as HTMLInputElement).checked) {
        // do whatever you want with the checked radio
        ipcRenderer.send('read-config', (radios[i] as HTMLInputElement).value);
        break;
      }
    }
    event.preventDefault();
    this.doSetDisplayConfigSelectionFalse();
  }

  getWebpackStats = (): void => {
    ipcRenderer.send('load-stats.json', 'ping');
    this.doSetLoadStatsFalse();
  }

  render() {
    const { store } = this.props;
    return (
      <div className="mainContainerHome">

        <div className={!store.displayWelcomeCard ? 'chartStatsHeadingBoxes' : 'displayOff'}>
          <div className="boxContainer">
            <div className="chartStatsHeadingBox">
              <div className='boxTextContainer'>
                <div>Total Size</div>
                <div className="textPrimaryColor">{store.beforeTotalSize}kb</div>
              </div>
            </div>
            <div className='boxLine'></div>
            <div className="chartStatsHeadingBox">
              <div className='boxTextContainer'>
                <div>Chunks</div>
                <div className="textPrimaryColor">{store.chunks}</div>
              </div>
            </div>
            <div className='boxLine'></div>
            <div className="chartStatsHeadingBox">
              <div className='boxTextContainer'>
                <div>Modules</div>
                <div className="textPrimaryColor">{store.modules}</div>
              </div>
            </div>
            <div className='boxLine'></div>
            <div className="chartStatsHeadingBox">
              <div className='boxTextContainer'>
                <div>Assets</div>
                <div className="textPrimaryColor">{store.assets}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={store.displayWelcomeCard ? 'whiteCard welcomeCard' : 'displayOff'} >
          <div id="welcomeHeader" >Welcome to WebpackOps</div>

          <div id="welcomeMessage">Please load your package.json file to begin optimizing your Webpack bundle</div>
        </div>

        {!store.isPackageSelected && <div className='whiteCard' >

          {!store.isPackageSelected && <div id="package-selector" className="">

            <div className='configMessageText'>Select your package.json</div>
            <button className="btn package" onClick={this.getPackageJson}>Find Package.JSON</button>
          </div>}
        </div>}

        {this.props.store.displayConfigSelection && store.isPackageSelected
          &&
          <div className="whiteCard">
            <div id="webpack-config-selector">
              <div className='configMessageText'>Select desired configuration</div>
              <form id="configSelector" onSubmit={this.getWebpackConfig} noValidate={true}>
                <div className="configRadios"><input type="radio" name="config" value="0" /><div style={{ display: 'inline-block' }}>"development": "rimraf dist && webpack --watch --config ./webpack.dev.js --progress --colors"</div><br /></div>
                <div className="configRadios"><input type="radio" name="config" value="1" /><div style={{ display: 'inline-block' }}>"production": "rimraf dist && webpack --config ./webpack.prod.js --progress --colors"</div><br /></div>
                <input className='btn package' type="submit" value="Select Config" />
              </form>
            </div>
          </div>
        }

        {store.isPackageSelected && !this.props.store.displayConfigSelection && this.props.store.displayLoadStats &&
          <div className="whiteCard">
            <div id="stats-file-selector" className="">
              <h4>Load Webpack Stats</h4>
              <button className="btn stats" onClick={this.getWebpackStats}>Load Stats File</button>
            </div>
          </div>
        }

        <div className={store.displayChartCard ? 'whiteCard' : 'whiteCardOff'}>
          <div className="smallerMainContainer">

            <div id="graphsContainer">


              <div className={store.displaySunburst ? 'd3DisplayOn' : 'd3DisplayOff'}>
                <div id="chart">
                  <div id="sequence"></div>
                  <div id="explanation">
                    <span id="filename"></span><br />
                    <span id="percentage"></span><br />

                    <div>
                      <span id="filesize"></span> <br />
                    </div>
                  </div>
                  <div className="chartSVGContainer">
                    <svg width={this.state.width} height={this.state.height} className="sunburst" />
                  </div>
                </div>

              </div>

              <div className={store.displayTreemap ? 'd3DisplayOn' : 'd3DisplayOff'}>
                <div id="sequenceTreeMap"></div>
                <div id="explanationTree">
                  <div id="ancestors"></div>
                  <span id="treemapText"></span>
                  <span id="filenameTree"></span><br />
                  <span id="percentageTree"></span><br />

                  <div>
                    <span id="filesizeTree"></span> <br />
                  </div>
                </div>

                <div style={{ paddingTop: '10px' }} id="chartTreeMap">
                  <div className="chartSVGContainer">
                    <svg width='650px' height={this.state.height} id="treemap" />
                  </div>
                </div>
              </div>

              <div className={store.displayTreemapZoom ? 'd3DisplayOn' : 'd3DisplayOff'}>
                <div id="explanationTreeZoom">
                  <div id="ancestorsZoom"></div>
                  <span id="treemapTextZoom"></span>
                  <span id="filenameTreeZoom"></span><br />
                  <span id="percentageTreeZoom"></span><br />
                  <div>
                    <span id="filesizeTreeZoom"></span> <br />
                  </div>
                </div>
                <div id="sequenceTreeMapZoom"></div>
                <div className="chartSVGContainer">
                  <div className='zoomTreemapColumnContainer'>
                    <div className="up">&larr; UP</div>
                    <div style={{ paddingTop: '10px' }} className="feature" id="chartTreeMapZoom">
                      <svg width={this.state.width} height={this.state.height} id="treemapZoom" />
                    </div>
                  </div>
                </div>
              </div>
              <div id="zoomContainer" className={store.displaySunburstZoom ? 'd3DisplayOn' : 'd3DisplayOff'}>
              </div>

            </div>
          </div>
        </div>
      </div >
    );
  }
}