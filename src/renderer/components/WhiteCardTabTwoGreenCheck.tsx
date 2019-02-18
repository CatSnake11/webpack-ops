import * as React from 'react';
import { FaCheck } from "react-icons/fa";

interface WhiteCardTabTwoGreenCheckProps {
  isBuildOptimized: boolean;
}

const WhiteCardTabTwoGreenCheck = (props: WhiteCardTabTwoGreenCheckProps) => {
  return (
    <div>
      {props.isBuildOptimized &&
        <div className="whiteCard">
          <div className="tabTwo-ThreeHeading">
            <FaCheck id="greenCheck" /> Optimization Complete
          </div>
        </div>
      }
    </div>
  );
}

export default WhiteCardTabTwoGreenCheck;