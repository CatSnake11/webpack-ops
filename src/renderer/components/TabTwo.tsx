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
    
  }

  


  render() {
    const { store } = this.props
    return (
      <div className="mainContainer">
        <div>TabTwo</div>
        <div>{store.name}</div>

        
      </div>
    );
  }
}


