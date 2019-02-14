import * as React from 'react';
import Button from './Button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { FaCheck } from "react-icons/fa";
import { paraisoLight } from 'react-syntax-highlighter/dist/styles/hljs';

interface WhiteCardTabThreeBuildConfigProps {
  handleChangeCheckboxReact(event: any): void;
  handleChangeCheckboxCSS(event: any): void;
  handleChangeCheckboxSass(event: any): void;
  handleChangeCheckboxLess(event: any): void;
  handleChangeCheckboxStylus(event: any): void;
  handleChangeCheckboxSVG(event: any): void;
  handleChangeCheckboxPNG(event: any): void;
  selectGenerateWebConfigRoot(event: any): void;
  isRootSelected: boolean;
  customConfigSaved: boolean;
  defaultFormattedCode: string;
}

const WhiteCardTabThreeBuildConfig: React.SFC<WhiteCardTabThreeBuildConfigProps> = (props) => {
  return (
    <div className="whiteCard">
      <div className="tabTwo-ThreeHeading" >Select your feature</div>
      <div className="tabThreeSelectionCodeContainer">
        <div className="tabThreeSelectionContainer">
          <div className="checkboxContainer">
            <div className="checkBoxPadding">
              <div className="pretty p-default p-round p-smooth">
                <input className="tabTwoCheckbox" type="checkbox" value="React" onChange={props.handleChangeCheckboxReact} />
                <div className="state p-primary">
                  <label>React </label><br />
                </div>
              </div>
            </div>
            <div className="checkBoxPadding">
              <div className="pretty p-default p-round p-smooth">
                <input className="tabTwoCheckbox" type="checkbox" value="CSS" onChange={props.handleChangeCheckboxCSS} />
                <div className="state p-primary">
                  <label>CSS </label><br />
                </div>
              </div>
            </div>
            <div className="checkBoxPadding">
              <div className="pretty p-default p-round p-smooth">
                <input className="tabTwoCheckbox" type="checkbox" value="Sass" onChange={props.handleChangeCheckboxSass} />
                <div className="state p-primary">
                  <label>Sass </label><br />
                </div>
              </div>
            </div>
            <div className="checkBoxPadding">
              <div className="pretty p-default p-round p-smooth">
                <input className="tabTwoCheckbox" type="checkbox" value="Less" onChange={props.handleChangeCheckboxLess} />
                <div className="state p-primary">
                  <label>Less </label><br />
                </div>
              </div>
            </div>
            <div className="checkBoxPadding">
              <div className="pretty p-default p-round p-smooth">
                <input className="tabTwoCheckbox" type="checkbox" value="stylus" onChange={props.handleChangeCheckboxStylus} />
                <div className="state p-primary">
                  <label>Stylus </label><br />
                </div>
              </div>
            </div>
            <div className="checkBoxPadding">
              <div className="pretty p-default p-round p-smooth">
                <input className="tabTwoCheckbox" type="checkbox" value="SVG" onChange={props.handleChangeCheckboxSVG} />
                <div className="state p-primary">
                  <label>SVG </label><br />
                </div>
              </div>
            </div>
            <div className="checkBoxPadding">
              <div className="pretty p-default p-round p-smooth">
                <input className="tabTwoCheckbox" type="checkbox" value="PNG" onChange={props.handleChangeCheckboxPNG} />
                <div className="state p-primary">
                  <label>PNG </label><br />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="tabThreeCodeContainer"></div>
        <SyntaxHighlighter language='javascript' style={paraisoLight} customStyle={{
          'borderRadius': '5px',
          'padding': '15px',
          'width': '500px',
          'height': '500px',
          'background': 'white',
          'opacity': '0.7'
        }}>{props.defaultFormattedCode}</SyntaxHighlighter>
      </div>
      {props.isRootSelected && !props.customConfigSaved &&
        <Button
          classes="btn stats"
          func={props.selectGenerateWebConfigRoot}
          textContent="Create Webpack Config File"
        />}
      {props.customConfigSaved && props.isRootSelected &&
        <div className="tabThreeRowFlexContainer">
          < FaCheck className="greenCheck" />
          <div id="webpackConfigSaveText">
            webpack.config.js saved
          </div>
        </div>
      }
    </div>
  );
}

export default WhiteCardTabThreeBuildConfig;