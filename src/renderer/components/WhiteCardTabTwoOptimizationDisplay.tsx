import * as React from 'react';

interface WhiteCardTabTwoOptimizationDisplayProps {
  beforeTotalSize: number;
  afterTotalSize: number;
}

const WhiteCardTabTwoOptimizationDisplay: React.SFC<WhiteCardTabTwoOptimizationDisplayProps> = (props) => {
  return (
    <div className="whiteCard">
      <div className="tabTwo-ThreeHeading">View bundle optimization below:</div>
      <div id='progressChartContainer'></div>
      <div className="lineBreak"></div>
      <div className="tabTwoInfoText">Size before optimization: <span className="dataFont">{(props.beforeTotalSize / 1000000).toPrecision(3)} Mb </span></div>
      <div className="tabTwoInfoText">Size after optimization: <span className="dataFont">{(props.afterTotalSize / 1000000).toPrecision(3)} Mb</span></div>
      <div className="tabTwoInfoText">Size reduction: <span className="dataFont">{((props.beforeTotalSize - props.afterTotalSize) / 1000000).toPrecision(3)} Mb</span></div>
      <div className="tabTwoInfoText">Percentage reduction: <span className="dataFont">{((((props.beforeTotalSize - props.afterTotalSize) / props.beforeTotalSize)) * 100).toPrecision(3)}%</span></div>
    </div>
  );
}

export default WhiteCardTabTwoOptimizationDisplay;