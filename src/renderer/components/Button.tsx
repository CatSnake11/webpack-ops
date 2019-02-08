import * as React from 'react';

interface ButtonProps {
  classes: string;
  idName?: string;
  func(): void;
  textContent: string;
}

export default class Button extends React.Component<ButtonProps, {}> {
  constructor(props: ButtonProps) {
    super(props);
  }

  public render() {

    return (
      <button
        className={this.props.classes}
        id={this.props.idName}
        onClick={this.props.func}
      >
        {this.props.textContent}
      </button>
    );
  }
}