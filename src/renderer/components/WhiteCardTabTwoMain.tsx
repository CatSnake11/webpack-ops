import * as React from 'react';
import Button from './Button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { paraisoLight } from 'react-syntax-highlighter/dist/styles/hljs';

interface WhiteCardTabTwoMainProps {
  handleChangeCheckboxSplitChunks(event: any): void;
  handleChangeCheckboxMoment(event: any): void;
  value: string;
  isOptimizationSelected: boolean;
  installPluggins(): void;
  drawProgressChart(): void;
}

const WhiteCardTabTwoMain: React.SFC<WhiteCardTabTwoMainProps> = (props) => {
  return (
    <div className="whiteCard">
      <div className="tabTwo-ThreeHeading">Optimization Plugins</div>
      <div className="tabThreeSelectionCodeContainer">
        <div className="checkboxContainer">
          <div className="checkBoxPadding">
            <div className="pretty p-default p-round p-smooth">
              <input className="tabTwoCheckbox" type="checkbox" value="splitchunks" onChange={props.handleChangeCheckboxSplitChunks} />
              <div className="state p-primary">
                <label>Vendor Bundle SplitChunks</label> <br />
              </div>
            </div>
          </div>
          <div className="checkBoxPadding">
            <div className="pretty p-default p-round p-smooth">
              <input className="tabTwoCheckbox" type="checkbox" value="moment" onChange={props.handleChangeCheckboxMoment} />
              <div className="state p-primary">
                <label>Moment Locale Ignore</label> <br />
              </div>
            </div>
          </div>
        </div>

        <div className="tabThreeCodeContainer">
          <SyntaxHighlighter language='javascript' style={paraisoLight} customStyle={{
            'borderRadius': '5px',
            'padding': '15px',
            'width': '500px',
            'height': '600px',
            'background': 'white',
            'opacity': '0.7'
          }}>{props.value}</SyntaxHighlighter>
        </div>


      </div>
      {
        !props.isOptimizationSelected &&
        <div>
          <Button
            classes="btn stats"
            idName="tabTwoStatsButton"
            func={props.installPluggins}
            textContent="Preview"
          />

          <Button
            classes="btn stats"
            idName="tabTwoStatsButton"
            func={props.drawProgressChart}
            textContent="Show Size Change"
          />
        </div>
      }
      <div id="configbox"></div>
    </div >
  );
}

export default WhiteCardTabTwoMain;