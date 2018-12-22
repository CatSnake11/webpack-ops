import * as React from 'react';

import * as d3 from 'd3';
import { number } from 'prop-types';

// declare var d3: any;
const initialState = {
  width: 500,
  height: 500,
  // colorValues: d3.scale.category20c(),
  data: {
    "name": "A1",
    "children": [
      {
        "name": "B1",
        "children": [
          {
            "name": "C1",
            "value": 100
          },
          {
            "name": "C2",
            "value": 300
          },
          {
            "name": "C3",
            "value": 200
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

type State = Readonly<typeof initialState>

export default class Home extends React.Component<any, State> {
  // may need "readonly"
  state: State = initialState
  componentDidMount() {
    this.drawChart();
  }

  private drawChart() {
    const svg = d3.select("svg")
      .append("circle")
      .attr("r", 250)
      .attr("cx", this.state.width / 2)
      .attr("cy", this.state.height / 2)
      .attr("fill", "aquamarine")
    // .attr("transform", "translate(" + this.state.width / 10 + "," + this.state.height / 10 + ")");

    const radius = Math.min(this.state.width, this.state.height) / 2;

    const root = d3.hierarchy(initialState.data);
    var handleEvents = function (selection: any) {
      selection.on('mouseover', function () {
        let g = d3.select(this);
        let n = g.select('.the-node');

        if (n.classed('solid')) {
          n.transition().duration(400)
            .style('fill', "rgba(211,0,0,0.8)")
            .attr('r', 18);
        } else {
          n.transition().duration(400)
            .style('fill', "rgba(211,0,0,0.8)");
        }

        g.select('.label')
          .transition().duration(700)
          .style('fill', 'white')

      })
        .on('mouseout', function () {
          let g = d3.select(this);
          let n = g.select('.the-node');

          if (n.classed('solid')) {
            n.transition().duration(400)
              .style('fill', "#696969")
              .attr('r', 14);
          } else {
            n.transition().duration(400)
              .style('fill', "rgba(255,255,255,0.2)")
          }
          g.select('.label')
            .transition().duration(700)
            .style('fill', "black")
        });
    }
    const sunburstLayout = d3.partition();

    sunburstLayout.size([2 * Math.PI, radius]);
    var arc = d3.arc()
      .startAngle(function (d) { return d.x0 })
      .endAngle(function (d) { return d.x1 })
      .innerRadius(function (d) { return d.y0 })
      .outerRadius(function (d) { return d.y1 })

    root.sum(d => d.value);

    sunburstLayout(root);

    const main = d3.select('svg');
    var sunburstNodes = main.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g').attr("class", "node")
      .attr("transform", "translate(" + this.state.width / 2 + "," + this.state.height / 2 + ")")
      .call(handleEvents)
    var paths = sunburstNodes.append('path')
      .attr('d', arc)
      .classed('the-node', true)
      .style('fill', 'rgba(25,255,255,0.2)')
      .style('stroke', '#2f2f2f')

    var labels = sunburstNodes.append("text")
      .attr('class', 'label')
      .attr("transform", function (d) {
        return "translate(" + arc.centroid(d)
          /*+ ") rotate(" + computeTextRotation(d) */ + ")";
      })
      .attr("dx", "-4")
      .attr("dy", '.5em')
      .text(function (d) { return d.parent ? d.data.name : "" });

    // https://bl.ocks.org/denjn5/f059c1f78f9c39d922b1c208815d18af
    function computeTextRotation(d) {
      var angle = (d.x0 + d.x1) / Math.PI * 90;
      return (angle < 180) ? angle - 90 : angle + 90;
    }
  }
  render() {
    return (
      <div className="mainContainer">
        <div>HOME</div>
        <button>Generate Bundle</button>
        <svg width={this.state.width} height={this.state.height} />
        {/* <main width={this.state.width} height={this.state.height} /> */}
      </div>
    );
  }
}