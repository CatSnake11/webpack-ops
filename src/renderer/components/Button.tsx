import * as React from 'react';

interface ButtonProps {
  classes: string;
  idName?: string;
  func(event?: any): void;
  textContent: string;
  condition?: boolean;
}

const Button = (props: ButtonProps) => {

  return (
    <button
      className={props.classes}
      disabled={props.condition}
      id={props.idName}
      onClick={props.func}
    >
      {props.textContent}
    </button>
  );
}

export default Button;