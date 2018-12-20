import * as React from 'react';
import { AppContextConsumer } from '../AppContext';

export default class TabTwo extends React.Component<any, any> {
  render() {
    return (
      <AppContextConsumer>
        {appContext => appContext && (
        <div className="mainContainer">
          <div>Name : {appContext.name}</div>
        </div>
        )}
      </AppContextConsumer>
    );
  }
}