import * as React from 'react';

interface WhiteCardWebpackConfigProps {
  listOfConfigs: string[];
  getWebpackConfig(event: any): void;
}

const WhiteCardWebpackConfig = (props: WhiteCardWebpackConfigProps) => {
  return (
    <div className="whiteCard">
      <div id="webpack-config-selector">
        <div className='tabOne-Heading'>Select desired configuration</div>
        <form id="configSelector" onSubmit={props.getWebpackConfig} noValidate={true}>
          {props.listOfConfigs.map(function (config, index) {
            return <div className='configRadios' key={index.toString() + 'a'}><input type="radio" name="config" value={index} key={index.toString()} /><div style={{ display: 'inline-block' }} key={index.toString() + 'b'}>{config}</div><br /></div>;
          })}
          <input id="selectConfigButton" className='btn package' type="submit" value="Select Config" />
        </form>
      </div>
    </div>
  );
}

export default WhiteCardWebpackConfig;