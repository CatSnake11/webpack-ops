import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Route, HashRouter as Router, Link, Switch } from 'react-router-dom';
import TabTwo from './components/TabTwo';
import TabThree from './components/TabThree';
import Home from './components/Home';
import { AppContextInterface, AppContextProvider } from './AppContext';

const sampleAppContext: AppContextInterface = {
  name: "kenneth",
  url: "url here",
}


// Import the styles here to process them with webpack
import './styles.scss';

class Nav extends React.Component {
  render() {
    return (
      <nav className="Nav">
        <div className="Nav__container">
          <ul className="Nav__item-wrapper">
            <li className="Nav__item">
              <Link className="Nav__link" to="/">Home</Link>
            </li>
            <li className="Nav__item">
              <Link className="Nav__link" to="/two">Tab 2</Link>
            </li>
            <li className="Nav__item">
              <Link className="Nav__link" to="/three">Tab 3</Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

ReactDOM.render(
  <AppContextProvider value={sampleAppContext}>
    <Router>
      <div>
        <Nav />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/two" component={TabTwo} />
          <Route exact path="/three" component={TabThree} />

        </Switch>
      </div>
    </Router>
  </AppContextProvider>
  ,
  document.getElementById('app')
);