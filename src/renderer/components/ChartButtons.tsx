import * as React from 'react';

export default class ChartButtons extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div id="buttonContainer">
        <button className="chartButtons" onClick={this.props.doSetDisplaySunburst}>Sunburst</button>
        <button className="chartButtons" onClick={this.props.doSetDisplaySunburstZoom}>Zoomable Sunburst</button>
        <button className="chartButtons" onClick={this.props.doSetDisplayTreemap}>Treemap</button>
        <button className="chartButtons2" id="treemapButton" onClick={this.props.doSetDisplayTreemapZoom}>Zoomable Treemap</button>
      </div>
    )
  }
}