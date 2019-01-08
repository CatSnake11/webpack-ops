import * as React from 'react';
import { observer, inject } from 'mobx-react'
import { StoreType } from '../store'
import { ipcRenderer } from 'electron';
import * as d3 from 'd3';

import AwesomeComponent from './AwesomeComponent';

type Props = {
  store?: StoreType
}

const initialState = {
  checkedMini: false,
  checkedSplitChunks: false,
  checkedMoment: false,
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
    })
  }

  drawProgressChart = (): void => {

    var data = [this.props.store.beforeTotalSize, this.props.store.afterTotalSize]; // here are the data values; v1 = total, v2 = current value

    var chart = d3.select("#container").append("svg") // creating the svg object inside the container div
      .attr("class", "chart")
      .attr("width", 200) // bar has a fixed width
      .attr("height", 20 * data.length);

    var x = d3.scaleLinear() // takes the fixed width and creates the percentage from the data values
      .domain([0, d3.max(data)])
      .range([0, 200]);

    chart.selectAll("rect") // this is what actually creates the bars
      .data(data)
      .enter().append("rect")
      .attr("width", x)
      .attr("height", 20)
      .attr("rx", 5) // rounded corners
      .attr("ry", 5);

    chart.selectAll("text") // adding the text labels to the bar
      .data(data)
      .enter().append("text")
      .attr("x", x)
      .attr("y", 10) // y position of the text inside bar
      .attr("dx", -3) // padding-right
      .attr("dy", ".35em") // vertical-align: middle
      .attr("text-anchor", "end") // text-align: right
      .text(String);
  }

  installPluggins = (): void => {
    const arr_plugins: string[] = ['checkedMini', 'checkedSplitChunks', 'checkedMoment'];
    let arrToInstall: string[] = arr_plugins.reduce((accum: string[], el: string): string[] => {
      console.log(el)
      if (this.state[el] === true) accum.push(el);
      return accum;
    }, [])
    console.log(arrToInstall)
    ipcRenderer.send('install-pluggins', arrToInstall)
  }

  handleChangeCheckboxMini = (event: any): void => {
    this.setState({ checkedMini: !this.state.checkedMini })
  }
  handleChangeCheckboxSplitChunks = (event: any): void => {
    this.setState({ checkedSplitChunks: !this.state.checkedSplitChunks })
  }
  handleChangeCheckboxMoment = (event: any): void => {
    this.setState({ checkedMoment: !this.state.checkedMoment })
  }

  render() {
    const { store } = this.props
    return (
      <div className="mainContainer">
        <div className="whiteCard">
          <div className="tabTwoHeading">Optimization Plugins</div>

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
                <input className="tabTwoCheckbox" type="checkbox" value="mini" onChange={this.handleChangeCheckboxSplitChunks} />
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
          <button id="tabTwoStatsButton" className="btn stats" onClick={this.installPluggins}>Install</button>
          <button id="tabTwoStatsButton" className="btn stats" onClick={this.drawProgressChart}>Show Size Change</button>
        </div>
        <div className="whiteCard">
          <div id='container'>

          </div>
        </div>
      </div>
    );
  }
}


