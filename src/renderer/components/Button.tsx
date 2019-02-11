import * as React from 'react';

interface ButtonProps {
  classes: string;
  idName?: string;
  func(event?: any): void;
  textContent: string;
}

const Button: React.SFC<ButtonProps> = (props) => {

  return (
    <button
      className={props.classes}
      id={props.idName}
      onClick={props.func}
    >
      {props.textContent}
    </button>
  );
}

export default Button;