import * as React from 'react';

interface D3ChartContainerCardProps {
  displayChartCard: boolean;
  displaySunburst: boolean;
  width: number;
  height: number;
  displayTreemap: boolean;
  displayTreemapZoom: boolean;
  displaySunburstZoom: boolean;
}

const D3ChartContainerCard = (props: D3ChartContainerCardProps) => {
  return (
    <div className={props.displayChartCard ? 'whiteCard' : 'whiteCardOff'}>
      <div className="smallerMainContainer">
        <div id="graphsContainer">
          <div className={props.displaySunburst ? 'd3DisplayOn' : 'd3DisplayOff'}>
            <div id="chart">
              <div id="sequence"></div>
              <div id="explanation">
                <span id="filename"></span><br />
                <span id="percentage"></span><br />
                <div>
                  <span id="filesize"></span> <br />
                </div>
              </div>
              <div className="chartSVGContainer">
                <svg width={props.width} height={props.height} className="sunburst" />
              </div>
            </div>
          </div>

          <div className={props.displayTreemap ? 'd3DisplayOn' : 'd3DisplayOff'}>
            <div id="sequenceTreeMap"></div>
            <div id="explanationTree">
              <div id="ancestors"></div>
              <span id="treemapText"></span>
              <span id="filenameTree"></span><br />
              <span id="percentageTree"></span><br />
              <div>
                <span id="filesizeTree"></span> <br />
              </div>
            </div>
            <div style={{ paddingTop: '10px' }} id="chartTreeMap">
              <div className="chartSVGContainer">
                <svg width='650px' height={props.height} id="treemap" />
              </div>
            </div>
          </div>

          <div className={props.displayTreemapZoom ? 'd3DisplayOn' : 'd3DisplayOff'}>
            <div id="explanationTreeZoom">
              <div id="ancestorsZoom"></div>
              <span id="treemapTextZoom"></span>
              <span id="filenameTreeZoom"></span><br />
              <span id="percentageTreeZoom"></span><br />
              <div>
                <span id="filesizeTreeZoom"></span> <br />
              </div>
            </div>
            <div id="sequenceTreeMapZoom"></div>
            <div className="chartSVGContainer">
              <div className='zoomTreemapColumnContainer'>
                <div className="up">&larr; UP</div>
                <div style={{ paddingTop: '10px' }} className="feature" id="chartTreeMapZoom">
                  <svg width={props.width} height={props.height} id="treemapZoom" />
                </div>
              </div>
            </div>
          </div>

          <div id="zoomContainer" className={props.displaySunburstZoom ? 'd3DisplayOn' : 'd3DisplayOff'}>
          </div>
        </div>
      </div>
    </div>
  );
}

export default D3ChartContainerCard;