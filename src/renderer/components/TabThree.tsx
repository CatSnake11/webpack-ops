import * as React from 'react';
import { observer, inject } from 'mobx-react'
import { StoreType } from '../store'
import { ipcRenderer } from 'electron';

type Props = {
  store?: StoreType
}

const initialState = {
  checkedReact: false,
  checkedTypescript: false,
  checkedCSS: false,
  checkedSass: false,
  rootCustomDirectory: '',
  AST: {},
}

type StateType = Readonly<typeof initialState>

@inject('store')
@observer

export default class TabThree extends React.Component<Props, StateType> {
  state: StateType = initialState;

  componentDidMount() {
    ipcRenderer.on('customRootDirectrySet', (event: any, customDirectory: string): void => {
      this.setState({ rootCustomDirectory: customDirectory });
    })

    ipcRenderer.send('CustomAST', 'ping')
    ipcRenderer.on('transferCustomAST', (event: any, astCustomConfig: any): void => {
      this.setState({ AST: astCustomConfig });
      console.log(this.state.AST)
    })

  }

  handleChangeCheckboxReact = (event: any): void => {
    if (this.state.checkedReact === false) ipcRenderer.send('addReactToAST')
    this.setState({ checkedReact: !this.state.checkedReact });
  }

  handleChangeCheckboxCSS = (event: any): void => {
    if (this.state.checkedCSS === false) ipcRenderer.send('addCSSToAST')
    this.setState({ checkedCSS: !this.state.checkedReact });
  }

  handleChangeCheckboxSass = (event: any): void => {
    this.setState({ checkedSass: !this.state.checkedReact });
  }

  selectCustomWebConfigRoot = (event: any): void => {
    ipcRenderer.send('selectCustomWebConfig', 'ping');
    this.props.store.isRootSelected = true;
  }

  selectGenerateWebConfigRoot = (event: any): void => {
  }

  render() {
    const { store } = this.props;
    return (
      <div className="mainContainerHome">
        <div>
          {!store.isRootSelected && <div className="whiteCard">
            <div className="tabTwo-ThreeHeading">Select your root directory</div>
            <button className="btn stats" onClick={this.selectCustomWebConfigRoot}>Select</button>
          </div>}

          {store.isRootSelected && <div className="whiteCard">
            <div className="selectMessageTabThree" >Select features to add to your Webpack.config</div>
            <div>{/*Here's your*/} {this.state.rootCustomDirectory}</div>
            <div className="checkboxContainer">
              <div className="checkBoxPadding">
                <div className="pretty p-default p-round p-smooth">
                  <input type="checkbox" value="React" onChange={this.handleChangeCheckboxReact} />
                  <div className="state p-primary">
                    <label>React </label><br />
                  </div>
                </div>
              </div>
              <div className="checkBoxPadding">
                <div className="pretty p-default p-round p-smooth">
                  <input type="checkbox" value="CSS" onChange={this.handleChangeCheckboxCSS} />
                  <div className="state p-primary">
                    <label>CSS </label><br />
                  </div>
                </div>
              </div>
              <div className="checkBoxPadding">
                <div className="pretty p-default p-round p-smooth">
                  <input type="checkbox" value="React" onChange={this.handleChangeCheckboxSass} />
                  <div className="state p-primary">
                    <label>Sass </label><br />
                  </div>
                </div>
              </div>
            </div>
            <button className="btn stats" onClick={this.selectGenerateWebConfigRoot}>Create Webpack Config File</button>
          </div>}
        </div>
      </div>
    );
  }
}