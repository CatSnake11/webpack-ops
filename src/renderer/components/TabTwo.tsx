import * as React from 'react';
import { observer, inject } from 'mobx-react'
import { StoreType } from '../store'
import { ipcRenderer } from 'electron';
import * as d3 from 'd3';
import WhiteCardTabTwoMain from './WhiteCardTabTwoMain';
import WhiteCardTabTwoGreenCheck from './WhiteCardTabTwoGreenCheck';
import WhiteCardTabTwoOptimizationDisplay from './WhiteCardTabTwoOptimizationDisplay';

type Props = {
  store?: StoreType
}

const initialState = {
  checkedMini: false,
  checkedSplitChunks: false,
  checkedMoment: false,
  value: "",
  newTotalSize: 0,
  isModalDisplayed: false,
  shouldContinue: false,
  rootDirectory: '',
}

type StateType = Readonly<typeof initialState>

@inject('store')
@observer

export default class TabTwo extends React.Component<Props, StateType> {
  state: StateType = initialState;
  _isMounted: boolean = false;

  constructor(props) {
    super(props);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleContinue = this.handleContinue.bind(this);
    this.getRootDirectory = this.getRootDirectory.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    ipcRenderer.on('done-installing', (event: any, arg: any): void => {
    });

    if (this.props.store.isOptimizationSelected) {
      this.drawProgressChart();
    }

    // Added for displaying webpack config
    ipcRenderer.on('display-config', (event: any, data: any): void => {

      this.doSetNewConfigDisplayCode(data);
      if (this._isMounted) {
        this.setState({ value: data });
      }
    });

    ipcRenderer.on('set-new-stats', (event: any, data: number): void => {

      this.doSetNewTotalSize(data);
      if (this._isMounted) {
        this.setState({
          newTotalSize: data
        }, () => this.doSetIsBuildOptimized());
      }
    });
  }

  doSetNewTotalSize = (newSize: number): void => {
    this.props.store.setNewTotalSize(newSize);
  }

  doSetNewConfigDisplayCode = (data: string): void => {
    this.props.store.setNewConfigDisplayCode(data);
  }

  doSetIsBuildOptimized = (): void => {
    if (this.props.store.newTotalSize - this.props.store.initialBuildSize < 0) {
      this.props.store.setIsBuildOptimized();
    }
    this.props.store.setIsNewBuildSizeCalculated();
  }

  drawProgressChart = (): void => {
    this.doSelectOptimization();
    setTimeout(() => {
      var data = [this.props.store.initialBuildSize, this.props.store.newTotalSize]; // here are the data values; v1 = total, v2 = current value

      var chart = d3.select("#progressChartContainer").append("svg") // creating the svg object inside the container div
        .attr("class", "progressChart")
        .attr("width", 700)
        .attr("height", 20 * data.length);

      var x = d3.scaleLinear() // takes the fixed width and creates the percentage from the data values
        .domain([0, d3.max(data)])
        .range([0, 700]);

      chart.selectAll("rect") // this is what actually creates the bars
        .data(data)
        .enter().append("rect")
        .attr("width", x)
        .attr("height", 35)
        .attr("rx", 18) // rounded corners
        .attr("ry", 18);

      chart.selectAll("text") // adding the text labels to the bar
        .data(data)
        .enter().append("text")
        .attr("x", x)
        .attr("y", 10) // y position of the text inside bar
        .attr("dx", -10) // padding-right
        .attr("dy", ".80em") // vertical-align: middle
        .attr("text-anchor", "end") // text-align: right
        .text(function (d) { return (d / 1000000).toPrecision(3) + ' Mb' });
    }, 0);
  }

  getRootDirectory = (): void => {
    ipcRenderer.send('get-root-directory');

    ipcRenderer.on('root-Directory-Found', (event: any, rootDirectory: string): void => {

      if (this._isMounted) {
        this.setState({ rootDirectory });
      }
    });
  }

  installPluggins = (): void => {
    const arr_plugins: string[] = ['checkedMini', 'checkedSplitChunks', 'checkedMoment'];
    let arrToInstall: string[] = arr_plugins.reduce((accum: string[], el: string): string[] => {
      // console.log(el)
      if (this.state[el] === true) accum.push(el);
      return accum;
    }, []);

    ipcRenderer.send('install-pluggins', arrToInstall);
    this.doSetIsNewConfigGenerated();
  }

  updateConfig = (event: any, data): void => {
    if (this._isMounted) {
      this.setState({ value: data });
    }
  }

  saveConfig = (): void => {
    this.installPluggins;
    let temp = this.state.value;
    ipcRenderer.send('save-config', this.state.value);
  }

  handleChangeCheckboxMini = (event: any): void => {
    if (this._isMounted) {
      this.setState({ checkedMini: !this.state.checkedMini });
    }
  }
  handleChangeCheckboxSplitChunks = (event: any): void => {
    if (this._isMounted) {
      this.setState({ checkedSplitChunks: !this.state.checkedSplitChunks });
    }
  }
  handleChangeCheckboxMoment = (event: any): void => {
    if (this._isMounted) {
      this.setState({ checkedMoment: !this.state.checkedMoment });
    }
  }

  // Added for handling webpack config editing
  handleConfigEdit = (event: any): void => {
    if (this._isMounted) {
      this.setState({ value: event.target.value });
    }
  }

  doSelectOptimization = (): void => {
    this.props.store.isOptimizationSelected = true;
  }

  doSetIsNewConfigGenerated = (): void => {
    this.props.store.setIsNewConfigGenerated();
  }

  handleShowModal = () => {
    this.getRootDirectory();

    ipcRenderer.send('does-webpack-ops-assets-exist');

    // if WebpackOpsAssets folder doesn't already exist, then open modal
    ipcRenderer.on('webpack-ops-assets-does-not-exist', () => {
      if (this._isMounted) {
        this.setState({ isModalDisplayed: true });
      }
    });

    // otherwise, call installPluggins from here
    ipcRenderer.on('call-install-pluggins', () => {
      this.installPluggins();
    });
  }

  handleCloseModal = () => {
    if (this._isMounted) {
      this.setState({ isModalDisplayed: false });
    }
  }

  handleContinue = () => {
    if (this._isMounted) {
      this.setState({ shouldContinue: true });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const codeString = '(num) => num + 1';
    const { store } = this.props;
    return (
      <div className="mainContainer">

        {store.isOptimizationSelected &&
          <WhiteCardTabTwoGreenCheck
            isBuildOptimized={store.isBuildOptimized}
          />
        }

        {store.isOptimizationSelected &&
          <WhiteCardTabTwoOptimizationDisplay
            isBuildOptimized={store.isBuildOptimized}
            beforeTotalSize={store.beforeTotalSize}
            afterTotalSize={store.afterTotalSize}
            initialBuildSize={store.initialBuildSize}
            newBuildSize={store.newTotalSize}
          />
        }

        {(!store.isOptimizationSelected || !store.isBuildOptimized) &&
          <WhiteCardTabTwoMain
            handleChangeCheckboxSplitChunks={this.handleChangeCheckboxSplitChunks}
            handleChangeCheckboxMoment={this.handleChangeCheckboxMoment}
            value={store.newConfigDisplayCode}
            isOptimizationSelected={store.isOptimizationSelected}
            installPluggins={this.installPluggins}
            drawProgressChart={this.drawProgressChart}
            isNewConfigGenerated={store.isNewConfigGenerated}
            isNewBuildSizeCalculated={store.isNewBuildSizeCalculated}
            isModalDisplayed={this.state.isModalDisplayed}
            handleCloseModal={this.handleCloseModal}
            handleShowModal={this.handleShowModal}
            handleContinue={this.handleContinue}
            rootDirectory={this.state.rootDirectory}
          />
        }

      </div >
    );
  }
}
