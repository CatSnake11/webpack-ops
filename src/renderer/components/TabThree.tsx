import * as React from 'react';
import { observer, inject } from 'mobx-react'
import { StoreType } from '../store'

type Props = {
  store?: StoreType
}

@inject('store')
@observer

export default class TabThree extends React.Component<Props, any> {

  doAddAge = (): void => {
    this.props.store.addAge();
  }
  doDecrementAge = (): void => {
    this.props.store.decrementAge();
  }
  doResetAge = (): void => {
    this.props.store.resetAge();
  }

  doHandlePathChange(event: any): void {
    this.props.store.setPath(event.target.value)
  }

  render() {
    const { store } = this.props
    return (
      <div className="mainContainer">
        <div>TabThree</div>
        <div>{store.age}</div>
        <button name="Update" onClick={this.doAddAge}>add Age</button>
        <button name="Decrement" onClick={this.doDecrementAge}>decrement Age</button>
        <button name="Reset" onClick={this.doResetAge} id="resetButton">reset Age</button>
        <input onChange={e => this.doHandlePathChange(e)} />
        <div>url: {store.path}</div>
      </div>
    );
  }
}