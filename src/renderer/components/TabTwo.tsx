import * as React from 'react';
import { observer, inject } from 'mobx-react'
import { StoreType } from '../store'
import { ipcRenderer } from 'electron';
import AwesomeComponent from './AwesomeComponent';

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

    ipcRenderer.on('choose-config', (event: any, arg: any): void => {
      console.log("list of configs - pick one")
      document.getElementById("webpack-config-selector").className="";
      console.log(arg) // prints "pong"
    })
    
  
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
    let radios: any = document.getElementsByName("config")

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
      <div className="mainContainer">
        <div>TabTwo</div>
        <div>{store.name}</div>

        <div id="package-selector" className="">
          <h4>Select your package.json</h4>
          <button id="btn-package" onClick={this.getPackageJson}>Find Package.JSON</button>
        </div>

        <div id="webpack-config-selector" className="hidden">
          <h4>Select desired configuration</h4>
          <form id="configSelector" onSubmit={this.getWebpackConfig} noValidate={true}>
            <input type="radio" name="config" value="0"/><div style={{display: 'inline-block'}}>"development"<br/> "rimraf dist && webpack --watch --config ./webpack.dev.js --progress --colors"</div><br/>
            <input type="radio" name="config" value="1"/><div style={{display: 'inline-block'}}>"production"<br/> "rimraf dist && webpack --config ./webpack.prod.js --progress --colors"</div><br/>
            <input type="submit" value="Submit"/>
          </form> 
        </div>

        <div id="stats-file-selector" className="">
          <h4>Load Webpack Stats</h4>
          <button id="btn-stats" onClick={this.getWebpackStats}>Load Stats File</button>
        </div>
      </div>
    );
  }
}


