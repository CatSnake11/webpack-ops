import * as React from 'react';

interface WhiteCardTabThreeWelcomeProps {
  isRootSelected: boolean;
}

const WhiteCardTabThreeWelcome = (props: WhiteCardTabThreeWelcomeProps) => {
  return (
    <div className="whiteCard welcomeCard">
      <div id="welcomeHeaderTabThree">Build Customized Webpack.config File</div>
      {!props.isRootSelected && <div id="welcomeMessageTabThree">Select your project's root directory where you would like to generate your <span className="codeTextStatsTabThree">Webpack.config</span> file</div>}
    </div>
  );
}

export default WhiteCardTabThreeWelcome;