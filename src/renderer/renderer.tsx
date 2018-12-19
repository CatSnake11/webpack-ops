import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Import the styles here to process them with webpack
import './styles.scss';

ReactDOM.render(
  <div>
    <h4>Welcome to React, Electron and Typescript</h4>
    <button>Generate Bundle</button>
  </div>,
  document.getElementById('app')
);