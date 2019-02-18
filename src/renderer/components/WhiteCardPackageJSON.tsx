import * as React from 'react';
import Button from './Button';

interface WhiteCardPackageJSONProps {
  isPackageSelected: boolean;
  getPackageJson(): void;
}

const WhiteCardPackageJSON = (props: WhiteCardPackageJSONProps) => {
  return (
    <div className='whiteCard' >
      {!props.isPackageSelected &&
        <div id="package-selector">
          <div className='tabOne-Heading'>Select your package.json</div>
          <Button
            classes="btn package"
            func={props.getPackageJson}
            textContent="Find Package.JSON"
          />
        </div>
      }
    </div>
  );
}

export default WhiteCardPackageJSON;