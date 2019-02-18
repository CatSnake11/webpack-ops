import * as React from 'react';

interface WhiteCardWelcomeProps {
  isWelcomeCardDisplayed: boolean;
  isPackageSelected: boolean;
}

const WhiteCardWelcome = (props: WhiteCardWelcomeProps) => {
  return (
    <div className={props.isWelcomeCardDisplayed ? 'whiteCard welcomeCard' : 'displayOff'} >
      <div id="welcomeHeader">Welcome to WebpackOps</div>
      {!props.isPackageSelected &&
        <div id="welcomeMessage">Please load your package.json file to begin optimizing your Webpack bundle</div>
      }
    </div>
  );
}

export default WhiteCardWelcome;