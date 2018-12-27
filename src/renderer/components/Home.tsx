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
  width: 700,
  height: 700,
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
            "children" :[
              {
                "name": "D1",
                "children":[
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
    this.drawTreemap();
    ipcRenderer.on('display-stats-reply', (event: any, data: string[][]): void => {
      console.log(data)


      let root:any = { "name": "root", "children": [] };
      for (let i:number = 0; i < data.length; i++) {
        let sequence:string = data[i][0];
        let size:number = +data[i][1];
        if (isNaN(size)) { // e.g. if this is a header row
          continue;
        }
        let parts: string[] = sequence.split("/");
        let currentNode = root;
        for (let j:number = 0; j < parts.length; j++) {
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
    
    })

    ipcRenderer.on('choose-config', (event: any, arg: any): void => {
      console.log("list of configs - pick one")
      this.props.store.setDisplayConfigSelectionTrue();
      console.log(arg)
    })
  }

  private drawChart(jsonData:any) {
    // const svg = d3.select("svg")
    //   .append("circle")
    //   .attr("r", 250)
    //   .attr("cx", this.state.width / 2)
    //   .attr("cy", this.state.height / 2)
    //   .attr("fill", "aquamarine")
    //   .attr("transform", "translate(" + this.state.width / 10 + "," + this.state.height / 10 + ")");
    console.log(jsonData)
    const radius = (Math.min(this.state.width, this.state.height) / 2) - 10;

    const root = d3.hierarchy(jsonData);
    var handleEvents = function (selection: any) {
      selection.on('mouseover', function (d: any, i: number, group: any) {
        let g = d3.select(group[i]);
        let n = g.select('.the-node');

        if (n.classed('solid')) {
          n.transition().duration(400)
            .style('fill', "rgba(25,100,255,0.3)")
            .attr('r', 18);
        } else {
          n.transition().duration(400)
            .style('fill', "rgba(25,100,255,0.3)");
        }

        g.select('.label')
          .transition().duration(700)
          .style('fill', 'grey')

      })
        .on('mouseout', function (d: any, i: number, group: any) {
          let g = d3.select(group[i]);
          let n = g.select('.the-node');

          if (n.classed('solid')) {
            n.transition().duration(400)
              .style('fill', "#696969")
              .attr('r', 14);
          } else {
            n.transition().duration(400)
              .style('fill', "rgba(25,100,255,0.5)")
          }
          g.select('.label')
            .transition().duration(700)
            .style('fill', "black")
        });
    }
    const sunburstLayout = d3.partition();

    sunburstLayout.size([2 * Math.PI, radius]);
    var arc: any = d3.arc()
      .startAngle(function (d) { return d.x0 })
      .endAngle(function (d) { return d.x1 })
      .innerRadius(function (d) { return d.y0 })
      .outerRadius(function (d) { return d.y1 })

    root.sum(d => d.value)
    .sort(function (a, b) { return b.value - a.value; });

    sunburstLayout(root);
    // console.log('root: ', root);

    const main = d3.select('#sunburst')
                  .attr("width", this.state.width)
                  .attr("height", this.state.height)
                  .append("svg:g")
                  .attr("transform", "translate(" + this.state.width / 2 + "," + this.state.height / 2 + ")");

    let nodes = sunburstLayout(root).descendants()
        .filter(function (d) {
          return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
        });
    
    let color = function () {
      let ctr = 0;
      const hex = ['#FCE883', '#64b0cc', '#7a6fca', '#ca6f96', '#e58c72', '#e5c072']
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

      var i = 0;
      var path = main.data([jsonData]).selectAll("path")
        .data(nodes)
        .enter().append("svg:path")
        .attr("display", function (d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", function (d) { return loopColors() })
        .style("opacity", 1)

    
      let totalSize = path.datum().value;
      console.log(totalSize)
    // https://bl.ocks.org/denjn5/f059c1f78f9c39d922b1c208815d18af
    // function computeTextRotation(d) {
    //   var angle = (d.x0 + d.x1) / Math.PI * 90;
    //   return (angle < 180) ? angle - 90 : angle + 90;
    // }
  }

  private drawTreemap() {
    const root = d3.hierarchy(this.state.data);
    const treemapLayout = d3.treemap();

    treemapLayout
      .size([600, 300])
      .paddingTop(20)
      .paddingInner(2);

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
      .attr("fill", 'rgba(25,100,255,0.2)')

    nodes
      .append('rect')
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style('stroke', '#FFFFFF')

    nodes
      .append('text')
      .attr('dx', 4)
      .attr('dy', 4)
      .style('fill', "#696969")
      .style('font-size', 10)
      .attr("transform", "translate(" + "10" + "," + "10" + ")")
      .text(function (d) {
        return d.data.name;
      })

    treemapLayout.tile(d3.treemapDice)
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
  
  getWebpackConfig = (event: any) :void => {
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

  getWebpackStats = () :void => {
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
                       <input type="radio" name="config" value="0"/><div style={{display: 'inline-block'}}>"development": "rimraf dist && webpack --watch --config ./webpack.dev.js --progress --colors"</div><br/>
                       <input type="radio" name="config" value="1"/><div style={{display: 'inline-block'}}>"production": "rimraf dist && webpack --config ./webpack.prod.js --progress --colors"</div><br/>
                       <input type="submit" value="Submit"/>
                     </form> 
                  </div>}
      
              <div id="stats-file-selector" className="">
                <h4>Load Webpack Stats</h4>
                <button className="btn stats" onClick={this.getWebpackStats}>Load Stats File</button>
              </div>
            </div>
          <div className="smallerMainContainer">

          <div id="graphsContainer">
              {store.isChartSelected && <svg width={this.state.width} height={this.state.height} id="sunburst" />}
              {store.isChartSelected && <svg width={this.state.width} height={this.state.height} id="treemap" />}
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