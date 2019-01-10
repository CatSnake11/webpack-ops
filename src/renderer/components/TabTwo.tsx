import * as React from 'react';
import { observer, inject } from 'mobx-react'
import { StoreType } from '../store'
import { ipcRenderer } from 'electron';
import * as d3 from 'd3';
import { FaCheck } from "react-icons/fa";

import AwesomeComponent from './AwesomeComponent';

type Props = {
  store?: StoreType
}

const initialState = {
  checkedMini: false,
  checkedSplitChunks: false,
  checkedMoment: false,
  value: ""
}

type StateType = Readonly<typeof initialState>


@inject('store')
@observer

export default class TabTwo extends React.Component<Props, StateType> {
  state: StateType = initialState;

  componentDidMount() {
    ipcRenderer.on('done-installing', (event: any, arg: any): void => {
      console.log("finished installation")
      console.log(arg)
    });

    if (this.props.store.isOptimizationSelected) {
      this.drawProgressChart();
    }

    // Added for displaying webpack config
    ipcRenderer.on('display-config', (event: any, data: any): void => {
      console.log("display updated config")
      this.setState({ value: data });
    })

  }

  drawProgressChart = (): void => {
    this.doSelectOptimization();
    setTimeout(() => {
      var data = [this.props.store.beforeTotalSize, this.props.store.afterTotalSize]; // here are the data values; v1 = total, v2 = current value

      var chart = d3.select("#progressChartContainer").append("svg") // creating the svg object inside the container div
        .attr("class", "progressChart")
        .attr("width", 700)
        .attr("height", 20 * data.length);

      var x = d3.scaleLinear() // takes the fixed width and creates the percentage from the data values
        .domain([0, d3.max(data)])
        .range([0, 700]);

      chart.selectAll("rect") // this is what actually creates the bars
        .data(data)
        .enter().append("rect")
        .attr("width", x)
        .attr("height", 35)
        .attr("rx", 18) // rounded corners
        .attr("ry", 18);

      // const dataStr = data.map(num => num + 'mb');

      chart.selectAll("text") // adding the text labels to the bar
        .data(data)
        .enter().append("text")
        .attr("x", x)
        .attr("y", 10) // y position of the text inside bar
        .attr("dx", -10) // padding-right
        .attr("dy", ".80em") // vertical-align: middle
        .attr("text-anchor", "end") // text-align: right
        .text(function (d) { return (d / 1000000).toPrecision(3) + ' Mb' });
    }, 0);
  }

  installPluggins = (): void => {
    const arr_plugins: string[] = ['checkedMini', 'checkedSplitChunks', 'checkedMoment'];
    let arrToInstall: string[] = arr_plugins.reduce((accum: string[], el: string): string[] => {
      console.log(el)
      if (this.state[el] === true) accum.push(el);
      return accum;
    }, [])
    console.log(arrToInstall)
    ipcRenderer.send('install-pluggins', arrToInstall);
  }

  updateConfig = (event: any, data): void => {
    this.setState({ value: data });
  }

  saveConfig = (): void => {
    this.installPluggins
    let temp = this.state.value
    //    setTimeout(function(){ipcRenderer.send('save-config', temp)}, 600)
    ipcRenderer.send('save-config', this.state.value)
  }

  handleChangeCheckboxMini = (event: any): void => {
    this.setState({ checkedMini: !this.state.checkedMini });
  }
  handleChangeCheckboxSplitChunks = (event: any): void => {
    this.setState({ checkedSplitChunks: !this.state.checkedSplitChunks });
  }
  handleChangeCheckboxMoment = (event: any): void => {
    this.setState({ checkedMoment: !this.state.checkedMoment });
    //    setTimeout(this.installPluggins, 100)
  }

  // Added for handling webpack config editing
  handleConfigEdit = (event: any): void => {
    this.setState({ value: event.target.value });
  }

  doSelectOptimization = (): void => {
    this.props.store.isOptimizationSelected = true;
  }

  render() {
    const { store } = this.props
    return (
      <div className="mainContainer">
        <div className="whiteCard">
          <div className="tabTwo-ThreeHeading">Optimization Plugins</div>

          <div className="checkboxContainer">
            <div className="checkBoxPadding">
              <div className="pretty p-default p-round p-smooth">
                <input className="tabTwoCheckbox" type="checkbox" value="mini" onChange={this.handleChangeCheckboxMini} />
                <div className="state p-primary">
                  <label>Mini </label><br />
                </div>
              </div>
            </div>
            <div className="checkBoxPadding">
              <div className="pretty p-default p-round p-smooth">
                <input className="tabTwoCheckbox" type="checkbox" value="splitchunks" onChange={this.handleChangeCheckboxSplitChunks} />
                <div className="state p-primary">
                  <label>Split Chunks</label> <br />
                </div>
              </div>
            </div>
            <div className="checkBoxPadding">
              <div className="pretty p-default p-round p-smooth">
                <input className="tabTwoCheckbox" type="checkbox" value="moment" onChange={this.handleChangeCheckboxMoment} />
                <div className="state p-primary">
                  <label>Moment</label> <br />
                </div>
              </div>
            </div>
          </div>

          {!store.isOptimizationSelected &&
            <div>
              <button id="tabTwoStatsButton" className="btn stats" onClick={this.installPluggins}>Preview</button>
              <button id="tabTwoStatsButton" className="btn stats" onClick={this.drawProgressChart}>Show Size Change</button>
            </div>}

          {store.isOptimizationSelected &&
            <div className="tabTwoCompleteText">
              <FaCheck id="greenCheck" /> Optimization Complete
            </div>}

          <div id="configbox">
            <textarea value={this.state.value} onChange={this.handleConfigEdit} />
          </div>

        </div>

        {store.isOptimizationSelected && <div className="whiteCard">
          <div className="tabTwoHeading">View bundle optimization below:</div>
          <div id='progressChartContainer'></div>
          <div className="lineBreak"></div>
          <div className="tabTwoInfoText">Size before optimization: <span className="dataFont">{(store.beforeTotalSize / 1000000).toPrecision(3)} Mb </span></div>
          <div className="tabTwoInfoText">Size after optimization: <span className="dataFont">{(store.afterTotalSize / 1000000).toPrecision(3)} Mb</span></div>
          <div className="tabTwoInfoText">Size reduction: <span className="dataFont">{((store.beforeTotalSize - store.afterTotalSize) / 1000000).toPrecision(3)} Mb</span></div>
          <div className="tabTwoInfoText">Percentage reduction: <span className="dataFont">{((((store.beforeTotalSize - store.afterTotalSize) / store.beforeTotalSize)) * 100).toPrecision(3)}%</span></div>
        </div>}
      </div>
    );
  }
}


