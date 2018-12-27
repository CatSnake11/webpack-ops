import * as React from 'react';
import * as d3 from 'd3';
import { observer, inject } from 'mobx-react'
import { StoreType } from '../store'
import { ipcRenderer } from 'electron';
import AwesomeComponent from './AwesomeComponent';

type Props = {
  store?: StoreType
}

// declare var d3: any;
const initialState = {
  width: 900,
  height: 900,
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
      console.log(root)
      console.log(this.state.data)
      this.drawChart(root);
      this.drawTreemap(root);

    })

    ipcRenderer.on('choose-config', (event: any, arg: any): void => {
      console.log("list of configs - pick one")
      this.props.store.setDisplayConfigSelectionTrue();
      console.log(arg)
    })
  }

  private drawChart(jsonData: any) {
    // const svg = d3.select("svg")
    //   .append("circle")
    //   .attr("r", 250)
    //   .attr("cx", this.state.width / 2)
    //   .attr("cy", this.state.height / 2)
    //   .attr("fill", "aquamarine")
    //   .attr("transform", "translate(" + this.state.width / 10 + "," + this.state.height / 10 + ")");

    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
    var _self = this;
    const b = {
      w: 75, h: 30, s: 3, t: 10
    };

    const radius = (Math.min(this.state.width, this.state.height) / 2) - 10;
    // const radius = (Math.min(this.state.width, this.state.height) / 2);
    const root = d3.hierarchy(jsonData);
    // const handleEvents = function (selection: any) {
    //   selection.on('mouseover', function (d: any, i: number, group: any) {
    //     let g = d3.select(group[i]);
    //     let n = g.select('.the-node');

    //     if (n.classed('solid')) {
    //       n.transition().duration(400)
    //         .style('fill', "rgba(25,100,255,0.3)")
    //         .attr('r', 18);
    //     } else {
    //       n.transition().duration(400)
    //         .style('fill', "rgba(25,100,255,0.3)");
    //     }

    //     g.select('.label')
    //       .transition().duration(700)
    //       .style('fill', 'grey')

    //   })
    //     .on('mouseout', function (d: any, i: number, group: any) {
    //       let g = d3.select(group[i]);
    //       let n = g.select('.the-node');

    //       if (n.classed('solid')) {
    //         n.transition().duration(400)
    //           .style('fill', "#696969")
    //           .attr('r', 14);
    //       } else {
    //         n.transition().duration(400)
    //           .style('fill', "rgba(25,100,255,0.5)")
    //       }
    //       g.select('.label')
    //         .transition().duration(700)
    //         .style('fill', "black")
    //     });
    // }
    const sunburstLayout = d3.partition();

    sunburstLayout.size([2 * Math.PI, radius]);
    const arc: any = d3.arc()
      .startAngle(function (d) { return d.x0 })
      .endAngle(function (d) { return d.x1 })
      .innerRadius(function (d) { return d.y0 * 1.5 })
      .outerRadius(function (d) { return d.y1 * 1.5 })

    const initializeBreadcrumbTrail = () => {
      // Add the svg area.
      var trail = d3.select("#sequence").append("svg:svg")
        .attr("width", this.state.width)
        .attr("height", 50)
        .attr("id", "trail");

      // Add the label at the end, for the percentage.
      trail.append("svg:text")
        .attr("id", "endlabel")
        .style("fill", "#fff");   //controls the color of the percentage
    }

    initializeBreadcrumbTrail();

    root.sum(d => d.value)
      .sort(function (a, b) { return b.value - a.value; });

    sunburstLayout(root);
    // console.log('root: ', root);

    const main = d3.select('.sunburst')
      .attr("width", this.state.width)
      .attr("height", this.state.height)
      .append("svg:g")
      .attr("id", "container")
      .attr("transform", "translate(" + this.state.width / 2 + "," + this.state.height / 2 + ")");

    main.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

    let nodes = sunburstLayout(root).descendants()
      .filter(function (d) {
        return (d.x1 - d.x0 > 0.0092); // 0.005 radians = 0.29 degrees
      });

    let color = function () {
      let ctr = 0;
      const hex = ['#8cc4d9', '#64b0cc', '#409dbf', '#337e99', '#265e73', '#193f4d']
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
      .on("mouseover", mouseover);

    let totalSize = path.datum().value;
    console.log(totalSize)
    // https://bl.ocks.org/denjn5/f059c1f78f9c39d922b1c208815d18af
    // function computeTextRotation(d) {
    //   var angle = (d.x0 + d.x1) / Math.PI * 90;
    //   return (angle < 180) ? angle - 90 : angle + 90;
    // }

    //////////////

    function mouseover(d) {
      var percentage = (100 * d.value / totalSize).toPrecision(3);
      var percentageString = percentage + "%";
      if (percentage < 0.1) {
        percentageString = "< 0.1%";
      }

      d3.select("#percentage")
        .text(percentageString);
      //ADDED FILE NAME
      d3.select("#filename")
        .text(d.data.name)

      //ADDED FILE SIZE
      d3.select("#filesize")
        .text('Size:' + d.value / 1000 + 'kb')

      d3.select("#explanation")
        .style("visibility", "");

      var sequenceArray = d.ancestors().reverse();
      sequenceArray.shift(); // remove root node from the array
      let trickArray = sequenceArray.slice(0);
      // convert path array to a '/' seperated path string. add '/' at the end if it's a directory.
      // const path = "./" + trickArray.map(node => node.data.name).join("/") + (trickArray[trickArray.length - 1].children ? "/" : "");
      // _self.props.onHover(path);

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
          .data(nodeArray, function (d) { return d.data.name + d.depth; });

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

        d3.select("#trail").select("#endlabel")
          .attr("x", (nodeAryFlatLengthPercentage))  //CONTROLS WHERE THE PERCENTAGE IS LOCATED
          .attr("y", b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "start")
          .text(percentageString);

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



























  private drawTreemap(jsonData: any) {
    var _self = this;
    const b = {
      w: 75, h: 30, s: 3, t: 10
    };

    const root = d3.hierarchy(jsonData);
    const treemapLayout = d3.treemap();

    treemapLayout
      .size([1000, 650])

    root.sum(function (d: any) {
      return d.value;
    });

    treemapLayout(root);

    const nodes = d3.select('#treemap')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', function (d) { return 'translate(' + [d.x0, d.y0] + ')' })
      .attr("fill", 'rgba(85, 183, 218, 0.2)')
      .on('mouseover', mouseoverTreemap);

    let totalSize = nodes.datum().value;

    function mouseoverTreemap(d: any): void {
      let percentage: number = (100 * d.value / totalSize)
      let percentageString: string = ""
      if (percentage < 0.1) {
        percentageString = "< 0.1%";
      } else percentageString = percentage.toPrecision(3); + '%'
      d3.select('#treemapText')
        .text(d.data.name)

      d3.select('#percentageTree')
        .text(percentageString)

      d3.select('#filesizeTree')
        .text(`Size: ${d.value / 1000} kb`)

      d3.select('#explanationTree')
        .style('visibility', '');

      d3.selectAll('#treemap').selectAll("nodes")
        .style("opacity", 0.2)

      const ancestorsArray = d.ancestors().reverse()
      ancestorsArray.shift();

      const ancestorsNameArray = ancestorsArray.map(el => {
        return el.data.name;
      })

      d3.select('#ancestors')
        .text(ancestorsNameArray.join("/"));
      // console.log(ancestorsNameArray)
    }

    nodes
      .append('rect')
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style('stroke', '#FFFFFF')

    // nodes
    //   .append('text')
    //   .attr('dx', 4)
    //   .attr('dy', 4)
    //   .style('fill', "#696969")
    //   .style('font-size', 10)
    //   .attr("transform", "translate(" + "10" + "," + "10" + ")")
    //   .text(function (d) {
    //     return d.data.name;
    //   })

    treemapLayout.tile(d3.treemapDice);

    ////////////////////////////////////////////////////////

    var chart = d3.select("#treemap");
    var cells = chart
      .selectAll(".node")
      // .data(nodes.descendants())
      .enter()
      .append("div")
      .attr("class", function (d) { return "node level-" + d.depth; })
      .attr("title", function (d) { return d.data.name ? d.data.name : "null"; });

    cells
      .style("left", function (d) { return x(d.x0) + "%"; })
      .style("top", function (d) { return y(d.y0) + "%"; })
      .style("width", function (d) { return x(d.x1) - x(d.x0) + "%"; })
      .style("height", function (d) { return y(d.y1) - y(d.y0) + "%"; })
      //.style("background-image", function(d) { return d.value ? imgUrl + d.value : ""; })
      //.style("background-image", function(d) { return d.value ? "url(http://placekitten.com/g/300/300)" : "none"; }) 
      .style("background-color", function (d) { while (d.depth > 2) d = d.parent; return color(d.data.name); })
      .on("click", zoom)
      .append("p")
      .attr("class", "label")
      .text(function (d) { return d.data.name ? d.data.name : "---"; });
    //.style("font-size", "")
    //.style("opacity", function(d) { return isOverflowed( d.parent ) ? 1 : 0; });

    var parent = d3.select(".up")
      .datum(nodes)
      .on("click", zoom);

    function zoom(d) { // http://jsfiddle.net/ramnathv/amszcymq/

      console.log('clicked: ' + d.data.name + ', depth: ' + d.depth);

      let currentDepth = d.depth;
      parent.datum(d.parent || nodes);

      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);

      var t = d3.transition()
        .duration(800)
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
  }

  handleDrawChart = (): void => {
    this.drawChart();
  }

  handleDrawTreeMap = (): void => {
    this.drawTreemap();
  }

  doSetIsChartSelectedTrue = (): void => {
    this.props.store.setIsChartSelectedTrue();
  }

  doSetIsChartSelectedFalse = (): void => {
    this.props.store.setIsChartSelectedFalse();
  }

  doSetIsLoadingTrue = (): void => {
    this.props.store.setIsLoadingTrue();
  }

  getPackageJson = (): void => {
    ipcRenderer.send('load-package.json', 'ping')
    this.doSetIsLoadingTrue();
  }

  //document.querySelector('#btn-package').addEventListener('click', getPackageJson)

  getWebpackConfig = (event: any): void => {
    console.log("getWebpackConfig")   //getting this far
    let radios = document.getElementsByName("config")

    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        // do whatever you want with the checked radio
        ipcRenderer.send('read-config', radios[i].value)
        break;
      }
    }
    event.preventDefault();
  }

  getWebpackStats = (): void => {
    ipcRenderer.send('load-stats.json', 'ping')
  }

  render() {
    const { store } = this.props
    return (
      <div className="mainContainerHome">
        <div>
          <div id="package-selector" className="">
            <h4>Select your package.json</h4>
            <button className="btn package" onClick={this.getPackageJson}>Find Package.JSON</button>
          </div>

          {this.props.store.displayConfigSelection
            && <div id="webpack-config-selector">
              <h4>Select desired configuration</h4>
              <form id="configSelector" onSubmit={this.getWebpackConfig} noValidate={true}>
                <input type="radio" name="config" value="0" /><div style={{ display: 'inline-block' }}>"development": "rimraf dist && webpack --watch --config ./webpack.dev.js --progress --colors"</div><br />
                <input type="radio" name="config" value="1" /><div style={{ display: 'inline-block' }}>"production": "rimraf dist && webpack --config ./webpack.prod.js --progress --colors"</div><br />
                <input type="submit" value="Submit" />
              </form>
            </div>}

          <div id="stats-file-selector" className="">
            <h4>Load Webpack Stats</h4>
            <button className="btn stats" onClick={this.getWebpackStats}>Load Stats File</button>
          </div>
        </div>
        <div className="smallerMainContainer">

          <div id="graphsContainer">
            <div id="sequence"></div>
            {store.isChartSelected &&
              <div id="chart">
                <div id="explanation">
                  <span id="filename"></span><br />
                  <span id="percentage"></span><br />

                  <div>
                    <span id="filesize"></span> <br />
                  </div>
                </div>
                <svg width={this.state.width} height={this.state.height} className="sunburst" />

              </div>
            }
            <div id="explanationTree">
              <div id="ancestors"></div>
              <span id="treemapText"></span>
              <span id="filenameTree"></span><br />
              <span id="percentageTree"></span><br />

              <div>
                <span id="filesizeTree"></span> <br />
              </div>
            </div>
            {store.isChartSelected &&
              <div id="chartTreeMap">
                <svg width={this.state.width} height={this.state.height} id="treemap" />
              </div>}
          </div>
          <div id="buttonContainer">
            <button onClick={this.doSetIsChartSelectedTrue}>Draw Chart</button>
            <button onClick={this.doSetIsChartSelectedFalse}>Draw Treemap</button>
          </div>
        </div>
      </div>
    );
  }
}