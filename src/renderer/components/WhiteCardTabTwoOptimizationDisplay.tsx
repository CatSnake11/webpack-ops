import * as React from 'react';

interface WhiteCardTabTwoOptimizationDisplayProps {
  beforeTotalSize: number;
  afterTotalSize: number;
  initialBuildSize: number;
  newBuildSize: number;
}

const WhiteCardTabTwoOptimizationDisplay = (props: WhiteCardTabTwoOptimizationDisplayProps) => {
  return (
    <div className="whiteCard">
      <div className="tabTwo-ThreeHeading">View bundle optimization below:</div>
      <div id='progressChartContainer'></div>
      <div className="lineBreak"></div>
      <div className="tabTwoInfoText">Size before optimization: <span className="dataFont">{(props.initialBuildSize / 1000000).toPrecision(3)} Mb </span></div>
      <div className="tabTwoInfoText">Size after optimization: <span className="dataFont">{(props.newBuildSize / 1000000).toPrecision(3)} Mb</span></div>
      <div className="tabTwoInfoText">Size reduction: <span className="dataFont">{((props.initialBuildSize - props.newBuildSize) / 1000000).toPrecision(3)} Mb</span></div>
      <div className="tabTwoInfoText">Percentage reduction: <span className="dataFont">{((((props.initialBuildSize - props.newBuildSize) / props.initialBuildSize)) * 100).toPrecision(3)}%</span></div>
    </div>
  );
}

export default WhiteCardTabTwoOptimizationDisplay;