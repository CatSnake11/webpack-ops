import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App'
import { Provider } from 'mobx-react';
import Store from './store'
import './styles.scss';

const store = new Store();

ReactDOM.render( 
<Provider store = {store}>
  <App />
</Provider>
, document.getElementById('app'));