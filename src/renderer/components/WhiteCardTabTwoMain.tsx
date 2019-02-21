import * as React from 'react';
import Button from './Button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { paraisoLight } from 'react-syntax-highlighter/dist/styles/hljs';
import Spinner from './AwesomeComponent';
import Modal from './Modal';

interface WhiteCardTabTwoMainProps {
  handleChangeCheckboxSplitChunks(event: any): void;
  handleChangeCheckboxMoment(event: any): void;
  value: string;
  isOptimizationSelected: boolean;
  isNewConfigGenerated: boolean;
  isNewBuildSizeCalculated: boolean;
  installPluggins(): void;
  drawProgressChart(): void;
  isModalDisplayed: boolean;
  handleCloseModal(): void;
  handleShowModal(): void;
  handleContinue(): void;
}

const WhiteCardTabTwoMain = (props: WhiteCardTabTwoMainProps) => {
  let aWord = <p>hello</p>
  return (
    <div className="whiteCard">
      <div className="tabTwo-ThreeHeading">Optimization Plugins</div>
      {!props.isNewConfigGenerated && <div className="tabTwoDescriptionText">Select from plugins below to generate new Webpack.config file with plugins added:</div>}
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

        {props.isNewConfigGenerated && <div className="tabThreeCodeContainer">
          <SyntaxHighlighter language='javascript' style={paraisoLight} customStyle={{
            'borderRadius': '5px',
            'padding': '15px',
            'width': '500px',
            'height': '600px',
            'background': 'white',
            'opacity': '0.7'
          }}>{props.value}</SyntaxHighlighter>
        </div>}

      </div>
      {
        !props.isOptimizationSelected &&
        <div className="tabTwoButtonContainer">
          <Button
            classes="btn stats"
            idName="tabTwoStatsButton"
            func={props.handleShowModal}
            textContent="Generate Webpack Config"
          />

          {props.isModalDisplayed ? (
            <Modal
              onClose={props.handleCloseModal}
              handleContinue={props.handleContinue}
              installPluggins={props.installPluggins}
            >
              Attention:
            </Modal>
          ) : null}

          {props.isNewConfigGenerated && !props.isNewBuildSizeCalculated && <Spinner />}

          {props.isNewBuildSizeCalculated &&
            <Button
              classes="btn btnFadeIn stats"
              idName="tabTwoStatsButton"
              func={props.drawProgressChart}
              textContent="Show Size Change"
            />
          }
        </div>
      }
      <div id="configbox"></div>
    </div >
  );
}

export default WhiteCardTabTwoMain;