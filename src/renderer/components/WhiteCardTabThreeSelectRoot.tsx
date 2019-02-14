import * as React from 'react';
import Button from './Button';

interface WhiteCardTabThreeSelectRootProps {
  selectCustomWebConfigRoot(event: any): void;
}

const WhiteCardTabThreeSelectRoot: React.SFC<WhiteCardTabThreeSelectRootProps> = (props) => {
  return (
    <div className="whiteCard">
      <div className="tabTwo-ThreeHeading">Select your root directory</div>
      <Button
        classes="btn stats"
        func={props.selectCustomWebConfigRoot}
        textContent="Select"
      />
    </div>
  );
}

export default WhiteCardTabThreeSelectRoot;