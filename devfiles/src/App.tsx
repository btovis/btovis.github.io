import { useEffect, useRef, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SidebarComp from './ui/SidebarComp.tsx';
import MainPage from './ui/MainPage.tsx';
import PageManager from './classes/PageManager.ts';
import { Fade, Spinner } from 'react-bootstrap';

function App() {
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayMessage, setOverlayMessage] = useState('');
    const [isOverlaySuccess, setIsOverlaySuccess] = useState(true);
    const [r, dud] = useState(0);
    const [pageManager, _] = useState(new PageManager());
    pageManager.refreshEverything = () => dud(r + 1);

    const borderRef = useRef(null);
    const spinnerRef = useRef(null);
    return (
        <div
            onDragOver={(event) => {
                event.preventDefault();
                if (borderRef.current) borderRef.current.style.opacity = 0.8;
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                if (borderRef.current) borderRef.current.style.opacity = 0;
            }}
            onDrop={(event) => {
                event.stopPropagation();
                event.preventDefault();
                if (spinnerRef.current) spinnerRef.current.style.opacity = 1;

                Promise.allSettled(
                    Array.prototype.map.call(event.dataTransfer.files, async (file) => {
                        if (!file.name.toLowerCase().endsWith('csv')) {
                            throw file.name;
                        }
                        window['pageManager'] = pageManager;
                        try {
                            pageManager.addCSV(file.name, new Uint8Array(await file.arrayBuffer()));
                        } catch (e) {
                            throw file.name;
                        }
                    })
                ).then((arr) => {
                    if (borderRef.current) borderRef.current.style.opacity = 0;
                    if (spinnerRef.current) spinnerRef.current.style.opacity = 0;
                    const rejected = arr
                        .filter((x) => x.status == 'rejected')
                        .map((x: PromiseRejectedResult) => x.reason);
                    setIsOverlaySuccess(rejected.length == 0);
                    if (rejected.length > 0)
                        setOverlayMessage(
                            'Did not parse:\n - ' +
                                rejected.join('\n - ') +
                                '\n Only CSVs exported from the BTO pipeline can be processed.'
                        );
                    else setOverlayMessage('Loaded file(s).');
                    setOverlayVisible(true);
                });
            }}
        >
            {/* The stuff above is solely for the drag and drop handling. */}
            {/* fileUploadIndic is what shows up when you drag a file in */}
            <div ref={borderRef} className='fileUploadIndic rounded'>
                <div>
                    <p>
                        <strong>Upload File</strong>
                    </p>
                    <Spinner
                        ref={spinnerRef}
                        style={{ opacity: 0 }}
                        animation='border'
                        role='status'
                    >
                        <span className='visually-hidden'>Loading...</span>
                    </Spinner>
                </div>
            </div>
            {/* This is the red or green banner that displays feedback*/}
            <Fade
                appear={true}
                timeout={1000}
                onEntered={() =>
                    setTimeout(() => setOverlayVisible(false), isOverlaySuccess ? 500 : 2000)
                }
                in={overlayVisible}
            >
                <div
                    className={
                        (isOverlaySuccess ? 'fileUploadSuccess' : 'fileUploadWarn') + ' rounded'
                    }
                >
                    <table>
                        <tbody>
                            {overlayMessage.split('\n').map((line, lineIdx) => (
                                <tr key={lineIdx}>
                                    <td>
                                        <strong>{line}</strong>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Fade>
            {/* This leads to the rest of the UI components*/}
            <div className='splitScreen'>
                <div className='sidebar'>
                    <SidebarComp pageManager={pageManager}></SidebarComp>
                </div>
                <div className='paner'>
                    <MainPage pageManager={pageManager}></MainPage>
                </div>
            </div>
        </div>
    );
}

export default App;
