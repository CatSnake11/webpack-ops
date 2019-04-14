import * as React from 'react';
import * as d3 from 'd3';
import { observer, inject } from 'mobx-react';
import { StoreType } from '../store';
import { ipcRenderer } from 'electron';
import HomeHeadingBox from './HomeHeadingBox';
import WhiteCardWelcome from './WhiteCardWelcome';
import WhiteCardPackageJSON from './WhiteCardPackageJSON';
import WhiteCardWebpackConfig from './WhiteCardWebpackConfig';
import WhiteCardStatsJSON from './WhiteCardStatsJSON';
import D3ChartContainerCard from './D3ChartContainerCard';
import ModalHome from './ModalHome';

type Props = {
  store?: StoreType
}

const initialState = {
  isPackageSelected: false,
  width: 550,
  height: 550,
  listOfConfigs: [],
  totalSizeTemp: '',
  initialBuildSize: 0,
  totalNodeCount: 0,
  totalAssets: 0,
  totalChunks: 0,
  isModalDisplayed: false,
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
  state: StateType = initialState;

  constructor(props) {
    super(props);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('display-stats-reply', (event: any, data: any[][], obj: any): void => {
      this.setState({
        totalAssets: obj.assets.length,
        totalChunks: obj.chunks.length,
        totalNodeCount: data.length,
      });
      // this is the stats.modules array of all modules  
      // console.log('returnObjData: ', obj);
      // console.log('data: ', data)

      let root: any = { "name": "root", "children": [] };
      for (let i: number = 0; i < data.length; i++) {
        let sequence: string = data[i][0];

        if (data[i][2]) {
          var issuerPath = data[i][2].map(el => el.name);
        }

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
              childNode = { "name": nodeName, "children": [], "issuerPath": issuerPath };
              children.push(childNode);
            }
            currentNode = childNode;
          } else {
            // Reached the end of the sequence; create a leaf node.
            childNode = { "name": nodeName, "value": size, "issuerPath": issuerPath };
            children.push(childNode);
          }
        }
      }
      this.doSetBeforeRoot(root);
      this.drawChart(this.props.store.beforeRoot);
      this.drawZoom(this.props.store.beforeRoot);
      this.drawTreemap(this.props.store.beforeRoot);
      this.drawTreemapZoom(this.props.store.beforeRoot);
      this.doSetDisplaySunburst();
      this.props.store.setWereChartsEverDrawn();
    })

    ipcRenderer.on('choose-config', (event: any, arg: any): void => {

      this.setState({
        listOfConfigs: arg
      });
      this.props.store.setDisplayConfigSelectionTrue();
    });

    ipcRenderer.on('package-is-selected', (): void => {
      this.props.store.setIsPackageSelectedTrue();
      this.doSetIsLoadingTrue();
    });

    ipcRenderer.on('stats-is-selected', (): void => {
      this.doSetLoadStatsFalse();
      this.doSetDisplayPluginsTabTrue();
    });

    ipcRenderer.on('original-stats-is-generated', (): void => {
      this.doSetOriginalStatsIsGenerated();
    });

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
      .startAngle(function (d: any) { return d.x0 })
      .endAngle(function (d: any) { return d.x1 })
      .innerRadius(function (d: any) { return d.y0 * 1.5 })
      .outerRadius(function (d: any) { return d.y1 * 1.5 });

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
      const hex = ['#8cc4d9', '#64b0cc', '#409dbf', '#337e99', '#265e73', '#193f4d'];

      return function () {
        if (ctr === hex.length - 1) {
          ctr = 0;
          return hex[ctr];
        } else {
          ctr++;
          return hex[ctr];
        }
      }
    }
    let loopColors = color();

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

    this.setState({
      totalSizeTemp: (totalSize / 1000000).toPrecision(3) + ' Mb',
      initialBuildSize: totalSize
    });

    function mouseover(d: any) {
      var percentage = (100 * d.value / totalSize).toPrecision(3);
      var percentageString = percentage + "%";
      if (Number(percentage) < 0.1) {
        percentageString = "< 0.1%";
      }


      let issuerPathArr = Object.values(d.data.issuerPath);

      let issuerPath = '';

      // format issuerPath string in reverse order 
      for (let i = issuerPathArr.length - 1; i >= 0; i -= 1) {
        issuerPath += issuerPathArr[i] + '  >  ';
      }

      d3.select("#percentage")
        .text('% of Total: ' + percentageString);

      //ADDED FILE NAME
      d3.select("#filename")
        .text(d.data.name);

      //ADDED FILE SIZE
      d3.select("#filesize")
        .text('Size: ' + d.value / 1000 + 'kb');

      //ADDED ISSUER PATH
      d3.select("#issuerPath")
        .text('issuerPath: ' + issuerPath)

      d3.select("#explanation")
        .style("visibility", "");

      // console.log('issuerPath: ', issuerPath);

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
          .style("fill", function (d) { return '#f7aab2'; });

        entering.append("svg:text")
          .attr("x", (b.w + b.t) / 2)
          .attr("y", b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "start")
          .text(function (d) { return d.data.name; });

        // Now move and update the percentage at the end.
        var nodeAryFlat = '';

        for (var i = 0; i < nodeArray.length; i++) {
          nodeAryFlat = nodeAryFlat + ' ' + nodeArray[i].data.name;
        }

        var nodeAryFlatLength = 0;
        var nodeAryFlatLengthPercentage = 0;
        for (var i = 1; i < nodeArray.length; i++) {
          nodeAryFlatLength = nodeAryFlatLength + b.w + nodeArray[i - 1].data.name.length * 7.5 + b.t;
          nodeAryFlatLengthPercentage = nodeAryFlatLength + b.w + nodeArray[i].data.name.length * 7.5 + b.t + 15;
        }

        entering.attr("transform", function (d, i) {
          if (i === 0) {
            return "translate(0, 0)";
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
    }

    d3.select("#container").on("mouseleave", mouseleave);
  }


  //////////////////////////////////////////////////////////////////////////////////////////////////


  private drawZoom(jsonData: any) {
    const width = 550;
    const height = 550;
    const maxRadius = (Math.min(width, height) / 2) - 5;

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
      .startAngle(function (d: any) { return x(d.x0) })
      .endAngle(function (d: any) { return x(d.x1) })
      .innerRadius(function (d: any) { return y(Math.max(0, d.y0)) })
      .outerRadius(function (d: any) { return y(Math.max(0, d.y1)) });

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

    const middleArcLine = (d: any) => {
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

    const textFits = (d: any) => {
      const CHAR_SPACE = 10;

      const deltaAngle = x(d.x1) - x(d.x0);
      const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
      const perimeter = r * deltaAngle;

      return d.data.name.length * CHAR_SPACE < perimeter;
    };

    const svg = d3
      .select('#zoomContainer')
      .append('svg')
      .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
      .on('click', () => focusOn()) // Reset zoom on canvas click
      .attr('id', 'viewBox');

    const root = d3.hierarchy(jsonData);
    root.sum(d => d.value)
      .sort(function (a, b) { return b.value - a.value; });


    const slice = svg.selectAll('g.slice').data(partition(root).descendants());

    slice.exit().remove();
    let path1 = d3.selectAll('g').data(root.descendants());
    let totalSize = path1.datum().value;

    const newSlice = slice
      .enter()
      .append('g')
      .attr('class', 'slice')
      .style('dominant-baseline', 'middle')
      .on('click', (d: any) => {
        d3.event.stopPropagation();
        focusOn(d);
      });

    newSlice
      .append('title')
      .text((d: any) => d.data.name + '\n' + formatNumber(d.value) + ' bytes' + '\n' + 'Of Total Size: ' +
        ((d.value / totalSize) * 100).toPrecision(3) + '%');

    newSlice
      .append('path')
      .attr('class', 'main-arc')
      .style('fill', (d: any) => color((d.children ? d : d.parent).data.name))
      .attr("d", (d: any) => arc(d));

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
      .text((d: any) => d.data.name);

    function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
      // Reset to top-level if no data point specified

      const transition = svg
        .transition()
        .duration(750)
        .tween('scale', () => {
          const xd = d3.interpolate(x.domain(), [d.x0, d.x1]);
          const yd = d3.interpolate(y.domain(), [d.y0, 1]);
          return t => {
            x.domain(xd(t));
            y.domain(yd(t));
          };
        });

      transition.selectAll('path.main-arc').attrTween('d', (d: any) => () => arc(d));

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
          .each(function (d: any) {
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
      .size([600, 450]);

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
      d3.select(d3.event.currentTarget)
        .attr("fill", 'rgba(85, 183, 208, 0.2)');

      d3.select("#trail2")
        .style("visibility", "hidden");

      d3.select('#explanationTree')
        .style("visibility", "hidden");
    }
    function mouseoverTreemap(d: any): void {
      let percentage: number = (100 * d.value / totalSize);
      let percentageString: string = "";
      if (percentage < 0.1) {
        percentageString = "< 0.1%";
      } else percentageString = percentage.toPrecision(3) + '%';

      d3.select('#percentageTree')
        .text(percentageString);

      d3.select('#filesizeTree')
        .text(`Size: ${d.value / 1000} kb`);

      d3.select('#explanationTree')
        .style('visibility', '');

      d3.select(d3.event.currentTarget)
        .attr("fill", 'rgba(10, 0, 218, 0.2)');

      const ancestorsArray = d.ancestors().reverse();
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
        .style("fill", function (d) { return '#f7aab2'; });

      entering.append("svg:text")
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(function (d) { return d.data.name; });

      // Now move and update the percentage at the end.
      var nodeAryFlat = '';

      for (var i = 0; i < nodeArray.length; i++) {
        nodeAryFlat = nodeAryFlat + ' ' + nodeArray[i].data.name;
      }

      var nodeAryFlatLength = 0;
      var nodeAryFlatLengthPercentage = 0;
      for (var i = 1; i < nodeArray.length; i++) {
        nodeAryFlatLength = nodeAryFlatLength + b.w + nodeArray[i - 1].data.name.length * 7.5 + b.t;
        nodeAryFlatLengthPercentage = nodeAryFlatLength + b.w + nodeArray[i].data.name.length * 7.5 + b.t + 15;
      }

      entering.attr("transform", function (d, i) {
        if (i === 0) {
          return "translate(0, 0)";
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
      .style('stroke', '#FFFFFF');

    treemapLayout.tile(d3.treemapDice);

    d3.select("#treemap").on("mouseleave", mouseoutTreemap);
  }


  private drawTreemapZoom(jsonData: any) {

    const x = d3.scaleLinear().domain([0, 100]).range([0, 100]);
    const y = d3.scaleLinear().domain([0, 100]).range([0, 100]);

    const color = d3.scaleOrdinal()
      .range(d3.schemeDark2
        .map(function (c: any) {
          c = d3.rgb(c);
          return c;
        })
      );

    const treemap = d3.treemap()
      .size([100, 100])
      .paddingInner(0)
      .round(false);

    const nodes = d3.hierarchy(jsonData)
      .sum(function (d) { return d.value ? 1 : 0; });

    let currentDepth: any;

    treemap(nodes);

    const chart = d3.select("#chartTreeMapZoom");
    const cells = chart
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
      .style("background-color", (d: any): any => { while (d.depth > 2) d = d.parent; return color(d.data.name) })
      .on("click", zoom)
      .append("p")
      .attr("class", "label")
      .text(function (d: any) { return d.data.name ? d.data.name : "---"; });

    var parent = d3.select(".up")
      .datum(nodes)
      .on("click", zoom);

    function zoom(d: any) {
      currentDepth = d.depth;
      parent.datum(d.parent || nodes);

      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);

      var t = d3.transition()
        .duration(400)
        .ease(d3.easeCubicOut);

      cells
        .transition(t)
        .style("left", (d: any) => x(d.x0) + "%")
        .style("top", (d: any) => y(d.y0) + "%")
        .style("width", (d: any) => x(d.x1) - x(d.x0) + "%")
        .style("height", (d: any) => y(d.y1) - y(d.y0) + "%");

      cells // hide this depth and above
        .filter((d: any) => d.ancestors())
        .classed("hide", function (d) { return d.children ? true : false });

      cells // show this depth + 1 and below
        .filter(function (d) { return d.depth > currentDepth; })
        .classed("hide", false);
    }

    treemap.tile(d3.treemapDice);
  }

  handleDrawChart = (arg: any): void => {
    this.drawChart(arg);
  }

  handleDrawTreeMap = (arg: any): void => {
    this.drawTreemap(arg);
  }

  doSetBeforeRoot = (root: any): void => {
    this.props.store.setBeforeRoot(root);
  }

  doSetInitialBuildSize = (): void => {
    this.props.store.setInitialBuildSize(this.state.initialBuildSize);
  }

  doSetDisplaySunburst = (): void => {
    this.props.store.setDisplaySunburst();
    if (!this.props.store.totalSizeTemp) {
      this.props.store.setUpdateCards(
        this.state.totalSizeTemp,
        this.state.totalNodeCount,
        this.state.totalAssets,
        this.state.totalChunks
      );
      this.doSetInitialBuildSize();
    }
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
  }

  doSetDisplayConfigSelectionFalse = (): void => {
    this.props.store.setDisplayConfigSelectionFalse();
  }

  doSetLoadStatsFalse = (): void => {
    this.props.store.setLoadStatsFalse();
  }

  doSetDisplayPluginsTabTrue = (): void => {
    this.props.store.setDisplayPluginsTabTrue();
  }

  doSetDisplayStatsFileGenerated = (): void => {
    this.props.store.setDisplayStatsFileGeneratedTrue();
  }

  doSetOriginalStatsIsGenerated = (): void => {
    this.props.store.setOriginalStatsIsGenerated();
  }

  getWebpackConfig = (event: any): void => {
    let radios = document.getElementsByName("config"); // as HTMLInputElement

    let configSelected: boolean = false;
    for (var i = 0, length = radios.length; i < length; i++) {
      if ((radios[i] as HTMLInputElement).checked) {
        // send the checked radio
        ipcRenderer.send('read-config', i);
        configSelected = true;
        break;
      }
    }

    // if no config selected, show modal informing user that they must select config
    if (!configSelected) {
      this.handleShowModal();
    }

    event.preventDefault();

    if (configSelected) {
      this.doSetDisplayConfigSelectionFalse();
    }
  }

  handleShowModal = () => {
    this.setState({ isModalDisplayed: true });
  }

  handleCloseModal = () => {
    this.setState({ isModalDisplayed: false });
  }

  getWebpackStats = (): void => {
    ipcRenderer.send('load-stats.json', 'ping');
  }

  generateStatsFile = (): void => {
    ipcRenderer.send('loadStats2');
    this.doSetDisplayStatsFileGenerated();
  }

  render() {
    const { store } = this.props;
    return (
      <div className="mainContainerHome">
        <div className={!store.isWelcomeCardDisplayed ? 'chartStatsHeadingBoxes' : 'displayOff'}>
          <div className="boxContainer">

            <HomeHeadingBox
              textContent="Total Size"
              displayDataString={store.totalSizeTemp}
            />

            <div className='boxLine'></div>

            <HomeHeadingBox
              textContent="Chunks"
              displayData={store.totalChunks}
            />

            <div className='boxLine'></div>

            <HomeHeadingBox
              textContent="Modules"
              displayData={store.totalNodeCount}
            />

            <div className='boxLine'></div>

            <HomeHeadingBox
              textContent="Assets"
              displayData={store.totalAssets}
            />

          </div>
        </div>

        <WhiteCardWelcome
          isWelcomeCardDisplayed={store.isWelcomeCardDisplayed}
          isPackageSelected={store.isPackageSelected}
        />

        {!store.isPackageSelected &&
          <WhiteCardPackageJSON
            isPackageSelected={store.isPackageSelected}
            getPackageJson={this.getPackageJson}
          />
        }

        {this.props.store.isConfigSelectionDisplayed && store.isPackageSelected &&
          <WhiteCardWebpackConfig
            getWebpackConfig={this.getWebpackConfig}
            listOfConfigs={this.state.listOfConfigs}
          />
        }

        {this.state.isModalDisplayed ? (
          <ModalHome
            onClose={this.handleCloseModal}
            isModalDisplayed={this.state.isModalDisplayed}
          >
            Attention:
            </ModalHome>
        ) : null}

        {store.isPackageSelected && !this.props.store.isConfigSelectionDisplayed && this.props.store.isLoadStatsDisplayed &&

          <WhiteCardStatsJSON
            isStatsFileGenerated={store.isStatsFileGenerated}
            getWebpackStats={this.getWebpackStats}
            generateStatsFile={this.generateStatsFile}
            isOriginalStatsGenerated={store.isOriginalStatsGenerated}
          />
        }

        <D3ChartContainerCard
          isChartCardDisplayed={store.isChartCardDisplayed}
          isSunburstDisplayed={store.isSunburstDisplayed}
          width={this.state.width}
          height={this.state.height}
          isTreemapDisplayed={store.isTreemapDisplayed}
          isTreemapZoomDisplayed={store.isTreemapZoomDisplayed}
          isSunburstZoomDisplayed={store.isSunburstZoomDisplayed}
        />
      </div>
    );
  }
}
