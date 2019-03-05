import * as React from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

interface ModalHomeProps {
  onClose(): void;
  children: string;
  isModalDisplayed: boolean;
}

function ModalHome(props: ModalHomeProps) {
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
        display: 'grid',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        animation: 'whiteCardFadeIn 0.6s',
      }}
      onClick={props.onClose}
    >
      <div
        style={{
          padding: 20,
          background: 'rgba(252, 252, 252, 1)',
          borderRadius: '2px',
          display: 'inline-block',
          minHeight: '175px',
          margin: '1rem',
          position: 'relative',
          minWidth: '575px',
          maxWidth: '575px',
          boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
          justifySelf: 'center',
          fontSize: '30px',
          marginBottom: '10px',
          color: '#485563',
          fontFamily: "'Oswald', 'sans-serif'",
          paddingLeft: '25px',
          animation: 'whiteCardFadeIn 0.6s',
        }}
      >
        {props.children}
        <hr />
        <div className="tabTwoDescriptionTextModal">
          <div className="modalText">No <span className="codeTextStatsHome">webpack.config</span> selected. Please select a config file to continue.</div>
          <br></br>

        </div>
        <div className="modalButtonContainer">
          <Button
            classes="btnModalContinue stats"
            idName="tabTwoStatsButton"
            func={props.onClose}
            textContent="Close"
          />

        </div>
      </div>
    </div >,
    document.querySelector("#modal"));
}

export default ModalHome;