import * as React from 'react';
import { observer, inject } from 'mobx-react'
import { StoreType } from '../store'
import { ipcRenderer } from 'electron';

type Props = {
  store?: StoreType
}

@inject('store')
@observer

export default class TabTwo extends React.Component<Props, any> {

  componentDidMount() {
    ipcRenderer.on('display-stats-reply', (event: any, arg: any): void => {
      console.log("callback")
      console.log(arg) // prints "pong"
    })
  
  }

  getPackageJson = () :void => {
    ipcRenderer.send('load-package.json', 'ping')
  }
  
  //document.querySelector('#btn-package').addEventListener('click', getPackageJson)
  
  getWebpackStats = () :void => {
    ipcRenderer.send('load-stats.json', 'ping')
  }
  
  //document.querySelector('#btn-stats').addEventListener('click', getWebpackStats)
  
  
  
  
  
  


  render() {
    const { store } = this.props
    return (
      <div className="mainContainer">
        <div>TabTwo</div>
        <div>{store.name}</div>

        <h4>Select your package.json</h4>
    <button id="btn-package" onClick={this.getPackageJson}>Find Package.JSON</button>
    <h4>Load Webpack Stats</h4>
    <button id="btn-stats" onClick={this.getWebpackStats}>Load Stats File</button>

      </div>
    );
  }
}


