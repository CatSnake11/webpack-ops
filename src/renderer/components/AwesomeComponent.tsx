import * as React from 'react';
import MDSpinner from "react-md-spinner";

export default class SpinnerExample extends React.Component<{}, any> {
  render() {
    return (
      <div className="spinner">
        <MDSpinner
          duration={2000}
          color1="#009688"
          color2="#009688"
          color3="#009688"
          color4="#AAAAAA"
          size={40}
        />
      </div>
    );
  }
}