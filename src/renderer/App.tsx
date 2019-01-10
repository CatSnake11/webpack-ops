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

  doSetHomeSelected = (): void => {
    this.props.store.setHomeSelected();
  }

  doSetTabTwoSelected = (): void => {
    this.props.store.setTabTwoSelected();
  }

  doSetTabThreeSelected = (): void => {
    this.props.store.setTabThreeSelected();
  }

  render() {
    const iconStyle = {
      fontSize: '22px',
      paddingRight: '10px'
    };
    const { store } = this.props;
    return (
      <nav className="Nav">
        <div id="logoContainer"></div>
        <div className="Nav__container">
          <ul className="Nav__item-wrapper">
            <li className="Nav__item" onClick={this.doSetChartNavClassOn}>
              <Link
                className={store.isHomeSelected ? "Nav__link selected" : "Nav__link"}
                to="/"
                onClick={this.doSetHomeSelected}
              >
                <FaHome style={iconStyle} />
                Home
              </Link>
            </li>

            {store.displayChartCard && <ul className={store.displayChartNav ? 'chartNav selected' : 'chartNavOff'} style={{ listStyleType: 'none' }}>
              <li
                className={store.isSunburstSelected ? "chartNavLinks chartNavLinkSelected" : "chartNavLinks"}
                onClick={this.doSetDisplaySunburst}
              >
                Sunburst
              </li>
              <li
                className={store.isSunburstZoomSelected ? "chartNavLinks chartNavLinkSelected" : "chartNavLinks"}
                onClick={this.doSetDisplaySunburstZoom}
              >
                Zoomable Sunburst
              </li>
              <li
                className={store.isTreemapSelected ? "chartNavLinks chartNavLinkSelected" : "chartNavLinks"}
                onClick={this.doSetDisplayTreemap}
              >
                Treemap
              </li>
              <li
                className={store.isTreemapZoomSelected ? "chartNavLinks chartNavLinkSelected" : "chartNavLinks"}
                onClick={this.doSetDisplayTreemapZoom}
              >
                Zoomable Treemap
              </li>
            </ul>}

            <li className="Nav__item" onClick={this.doSetChartNavClassOff}>
              <Link
                className={store.isTabTwoSelected ? "Nav__link selected" : "Nav__link"}
                to="/two"
                onClick={this.doSetTabTwoSelected}
              >
                <FaCube style={iconStyle} />
                Plugins
              </Link>
            </li>
            <li className="Nav__item" onClick={this.doSetChartNavClassOff}>
              <Link
                className={store.isTabThreeSelected ? "Nav__link selected" : "Nav__link"}
                to="/three"
                onClick={this.doSetTabThreeSelected}
              >
                <IoLogoBuffer style={iconStyle} />
                Webpack Config
              </Link>
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