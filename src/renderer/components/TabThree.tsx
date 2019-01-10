import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { StoreType } from '../store';
import { ipcRenderer } from 'electron';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco, tomorrowNight, dracula, darcula, tomorrowNightBlue, tomorrowNightEighties, monokai, obsidian, kimbieDark, paraisoLight } from 'react-syntax-highlighter/dist/styles/hljs';
import { dark } from 'react-syntax-highlighter/dist/styles/prism';


type Props = {
  store?: StoreType
}

const initialState = {
  checkedReact: false,
  checkedTypescript: false,
  checkedCSS: false,
  checkedSass: false,
  checkedLess: false,
  checkedStylus: false,
  checkedSVG: false,
  checkedPNG: false,
  rootCustomDirectory: '',
  defaultFormattedCode: '',
  AST: {},
}

type StateType = Readonly<typeof initialState>

@inject('store')
@observer

export default class TabThree extends React.Component<Props, StateType> {
  state: StateType = initialState;

  componentDidMount() {
    ipcRenderer.on('customRootDirectrySet', (event: any, customDirectory: string): void => {
      this.setState({rootCustomDirectory:customDirectory})
    })



    ipcRenderer.send('CustomAST', 'ping')
    ipcRenderer.on('transferCustomAST', (event: any, formattedCode1: string): void => {
      console.log(formattedCode1)
      console.log('hi')
      console.log(typeof formattedCode1)
      this.setState({defaultFormattedCode: formattedCode1})
      //console.log(this.state.AST)
    })

  }

  handleChangeCheckboxReact = (event: any): void => {
    if (this.state.checkedReact === false) ipcRenderer.send('addReactToAST');
    else ipcRenderer.send('removeReactToAST');

    this.setState({checkedReact :!this.state.checkedReact})
  }

  handleChangeCheckboxCSS = (event: any): void => {
    if (this.state.checkedCSS === false) ipcRenderer.send('addCSSToAST');
    else ipcRenderer.send('removeCSSToAST');

    this.setState({checkedCSS :!this.state.checkedCSS});
  }

  handleChangeCheckboxSass = (event: any): void => {
    if (this.state.checkedSass === false) ipcRenderer.send('addSassToAST');
    else ipcRenderer.send('removeSassToAST');

    this.setState({checkedSass :!this.state.checkedSass});
  }

  handleChangeCheckboxLess = (event: any): void => {
    if (this.state.checkedLess === false) ipcRenderer.send('addLessToAST');
    else ipcRenderer.send('removeLessToAST');

    this.setState({checkedLess :!this.state.checkedLess});
  }

  handleChangeCheckboxStylus = (event: any): void => {
    if (this.state.checkedStylus === false) ipcRenderer.send('addStylusToAST');
    else ipcRenderer.send('removeStylusToAST');

    this.setState({checkedStylus :!this.state.checkedStylus});
  }

  handleChangeCheckboxSVG = (event: any): void => {
    console.log('infunction first')
    if (this.state.checkedSVG === false) ipcRenderer.send('addSVGToAST');
    else ipcRenderer.send('removeSVGToAST');

    this.setState({checkedSVG :!this.state.checkedSVG});
  }

  handleChangeCheckboxPNG = (event: any): void => {
    if (this.state.checkedPNG === false) ipcRenderer.send('addPNGToAST');
    else ipcRenderer.send('removePNGToAST');

    this.setState({checkedPNG :!this.state.checkedPNG});
  }

  selectCustomWebConfigRoot = (event: any): void => {
    ipcRenderer.send('selectCustomWebConfig', 'ping')
  }

  selectGenerateWebConfigRoot = (event: any): void => {

  }

  render() {
    const codeString = '(num) => num + 1';
    const { store } = this.props
    return (
      <div className="mainContainerHome">
        <div>
          <div className="whiteCard">
            <div>Select your root directory</div>
            <button onClick={this.selectCustomWebConfigRoot}>Select</button>
          </div>
          <div className="whiteCard">
            <div>Select your feature</div>
            <div className="tabThreeSelectionCodeContainer">
            <div className="tabThreeSelectionContainer">
            <input type="checkbox" value="React" onChange={this.handleChangeCheckboxReact} />React <br />
            <input type="checkbox" value="CSS" onChange={this.handleChangeCheckboxCSS} />CSS <br />
            <input type="checkbox" value="Sass" onChange={this.handleChangeCheckboxSass} />Sass <br />
            <input type="checkbox" value="Less" onChange={this.handleChangeCheckboxLess} />Less <br />
            <input type="checkbox" value="stylus" onChange={this.handleChangeCheckboxStylus} />stylus <br />
            <input type="checkbox" value="SVG" onChange={this.handleChangeCheckboxSVG} />SVG <br />
            <input type="checkbox" value="PNG" onChange={this.handleChangeCheckboxPNG} />PNG <br />
            </div>
            <div className="tabThreeCodeContainer"></div>
            <SyntaxHighlighter language='javascript' style={paraisoLight} customStyle={{'borderRadius':'5px', 'padding':'15px', 'width': '500px', 'background': 'white', 'opacity': '0.7'}}>{this.state.defaultFormattedCode}</SyntaxHighlighter>
            </div>
            </div>
            <button onClick={this.selectGenerateWebConfigRoot}>Create Webpack Config File</button>
          </div>
        </div>
    );
  }
}