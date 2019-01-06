import * as React from 'react';
import { Route, HashRouter as Router, Link, Switch } from 'react-router-dom';
import TabTwo from './components/TabTwo';
import TabThree from './components/TabThree';
import Home from './components/Home';
import { FaHome } from "react-icons/fa";
import { FaCube } from "react-icons/fa";
import { IoLogoBuffer } from "react-icons/io";
import { observer, inject } from 'mobx-react'
import { StoreType } from './store'
import { MDCDrawer } from "@material/drawer";
// Import the styles here to process them with webpack
import './styles.scss';

type Props = {
  store?: StoreType
}

// type StateType = Readonly<typeof initialState>
@inject('store')
@observer

class Nav extends React.Component<Props, {}> {

  doSetDisplaySunburst = (): void => {
    this.props.store.setDisplaySunburst();
  }

  doSetDisplaySunburstZoom = (): void => {
    this.props.store.setDisplaySunburstZoom();
  }
  doSetDisplayTreemap = (): void => {
    this.props.store.setDisplayTreemap();
  }
  doSetDisplayTreemapZoom = (): void => {
    this.props.store.setDisplayTreemapZoom();
  }

  doSetChartNavClassOn = (): void => {
    this.props.store.setChartNavClassOn();
  }

  doSetChartNavClassOff = (): void => {
    this.props.store.setChartNavClassOff();
  }

  render() {
    const { store } = this.props;
    return (
      <nav className="Nav">
        <div className="Nav__container">
          <ul className="Nav__item-wrapper">
            <li className="Nav__item" onClick={this.doSetChartNavClassOn}>
              <Link className="Nav__link" to="/">Home  <FaHome /></Link>
            </li>

            <ul className={store.displayChartNav ? 'chartNav' : 'chartNavOff'} style={{ listStyleType: 'none' }}>
              <li className="chartNavLinks" onClick={this.doSetDisplaySunburst}>Sunburst</li>
              <li className="chartNavLinks" onClick={this.doSetDisplaySunburstZoom}>Zoomable Sunburst</li>
              <li className="chartNavLinks" onClick={this.doSetDisplayTreemap}>Treemap</li>
              <li className="chartNavLinks" onClick={this.doSetDisplayTreemapZoom}>Zoomable Treemap</li>
            </ul>
            <li className="Nav__item" onClick={this.doSetChartNavClassOff}>
              <Link className="Nav__link" to="/two">Plugins <FaCube /></Link>
            </li>
            <li className="Nav__item" onClick={this.doSetChartNavClassOff}>
              <Link className="Nav__link" to="/three">Webpack Config <IoLogoBuffer /></Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default class App extends React.Component<any, any> {
  render() {
    return (
      <Router>
        <div className="fullAppContainer">
          <Nav />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/two" component={TabTwo} />
            <Route exact path="/three" component={TabThree} />
          </Switch>
        </div>
      </Router>
    )
  }
}