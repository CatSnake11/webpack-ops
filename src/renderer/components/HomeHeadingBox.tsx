import * as React from 'react';

interface HeadingBoxProps {
  textContent: string;
  displayDataString?: string;
  displayData?: number;
}

const HomeHeadingBox: React.SFC<HeadingBoxProps> = (props) => {
  return (
    <div className="chartStatsHeadingBox">
      <div className='boxTextContainer'>
        <div>{props.textContent}</div>
        <div className="textPrimaryColor">
          {props.displayDataString || props.displayData}
        </div>
      </div>
    </div>
  );
}

export default HomeHeadingBox;