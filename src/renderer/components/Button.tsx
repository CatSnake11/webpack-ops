import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { StoreType } from '../store';
import { ipcRenderer } from 'electron';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { FaCheck } from "react-icons/fa";

export default class Button extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      classname: this.props.classes,
      func: this.props.func,
      textContent: this.props.textContent,
      id: this.props.idName
    }
  }

  public render() {

    return (
      <button
        className={this.state.classname}
        id={this.state.id}
        onClick={this.state.func}
      >
        {this.state.textContent}
      </button>
    );
  }
}