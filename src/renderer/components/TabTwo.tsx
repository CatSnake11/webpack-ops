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

  installPluggins = () :void => {
    const arr_plugins: string[] = ['checkedMini', 'checkedSplitChunks', 'checkedMoment'];
    let arrToInstall: string[] = arr_plugins.reduce((accum:string[] ,el:string): string[] => {
      console.log(el)
      if (this.state[el] === true) accum.push(el);
      return accum;
    }, [])
    console.log(arrToInstall)
    ipcRenderer.send('install-pluggins', arrToInstall)
  }

  handleChangeCheckboxMini = (event: any): void => {
    this.setState({checkedMini :!this.state.checkedMini})
  }
  handleChangeCheckboxSplitChunks = (event: any): void => {
    this.setState({checkedSplitChunks :!this.state.checkedSplitChunks})
  }
  handleChangeCheckboxMoment = (event: any): void => {
    this.setState({checkedMoment :!this.state.checkedMoment})
  }

  render() {
    const { store } = this.props
    return (
      <div className="mainContainer">
        <div>Optimization Plugins</div>
        <div></div>
        <input type="checkbox" value="mini" onChange={this.handleChangeCheckboxMini} />Mini <br />
        <input type="checkbox" value="mini" onChange={this.handleChangeCheckboxSplitChunks} />Split Chunks <br />
        <input type="checkbox" value="mini" onChange={this.handleChangeCheckboxMoment} />Moment <br />
        <button className="btn stats" onClick={this.installPluggins}>Install</button>
        
      </div>
    );
  }
}


