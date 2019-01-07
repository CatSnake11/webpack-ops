import * as React from 'react';
import { observer, inject } from 'mobx-react'
import { StoreType } from '../store'
import { ipcRenderer } from 'electron';

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
        </div>
      </div>
    );
  }
}


