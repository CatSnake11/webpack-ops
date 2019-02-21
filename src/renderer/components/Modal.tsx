import * as React from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

interface ModalProps {
  onClose(): void;
  handleContinue(): void;
  installPluggins(): void;
  children: string;
}

function Modal(props: ModalProps) {
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'absolute',
        top: '0',
        bottom: '0', ////////
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
          background: '#fff',
          borderRadius: '2px',
          display: 'inline-block',
          // minHeight: '300px',
          minHeight: '275px',
          margin: '1rem',
          position: 'relative',
          minWidth: '300px',
          maxWidth: '375px',
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
          <div className="modalText">A new 'WebpackOpsAssets' directory will be created, and your new <span className="codeTextModal">webpack.config</span>
            and <span className="codeTextModal" id="codeText2">stats.json</span> files will be generated using your selected plugins and stored in the
            'WebpackOpsAssets' directory.
            </div>
          <ul className="modalList">
            <br></br>
            <li>To give permission - click 'Continue'</li>
            <br></br>
            <li>If you would not like to continue - click 'Cancel'</li>
          </ul>
        </div>
        <Button
          classes="btn stats"
          idName="tabTwoStatsButton"
          func={props.installPluggins}
          textContent="Continue"
        />

        <Button
          classes="btn stats"
          func={props.onClose}
          textContent="Cancel"
        />

        {/* <button onClick={props.installPluggins}>Continue</button>
        <button onClick={props.onClose}>Cancel</button> */}
      </div>
    </div >,
    document.querySelector("#modal"));
}

export default Modal;