import * as React from 'react';
import { FaCheck } from "react-icons/fa";

const WhiteCardTabTwoGreenCheck: React.SFC<{}> = () => {
  return (
    <div className="whiteCard">
      <div className="tabTwo-ThreeHeading">
        <FaCheck id="greenCheck" /> Optimization Complete
      </div>
    </div>
  );
}

export default WhiteCardTabTwoGreenCheck;