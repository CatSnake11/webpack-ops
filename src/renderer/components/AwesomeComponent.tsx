import * as React from 'react';
import MDSpinner from "react-md-spinner";

export default class Spinner extends React.Component<{}, any> {
  render() {
    return (
      <div className="spinner">
        <MDSpinner
          duration={2000}
          color1="#485563"
          color2="#485563"
          color3="#485563"
          color4="#AAAAAA"
          size={26}
        />
      </div>
    );
  }
}