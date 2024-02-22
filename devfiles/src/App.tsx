import { useRef, useState } from 'react';
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
    const [pageManager, _] = useState(PageManager.get());
    pageManager.refreshEverything = () => dud(r + 1);

    const borderRef = useRef(null);
    const spinnerRef = useRef(null);

    const renderFileProcess = (files: FileList) => {
        //Yes, do this AGAIN to facilitate use from GlobalOptionsComp
        if (borderRef.current) borderRef.current.style.opacity = 0.8;
        if (spinnerRef.current) spinnerRef.current.style.opacity = 1;

        Promise.allSettled(
            Array.prototype.map.call(files, async (file) => ({
                name: file.name,
                data: new Uint8Array(await file.arrayBuffer())
            }))
        ).then((arr) => {
            const rejected = [];
            arr.forEach((file: PromiseFulfilledResult<{ name: string; data: Uint8Array }>) => {
                if (!file.value.name.toLowerCase().endsWith('csv')) {
                    rejected.push(file.value.name);
                    return;
                }
                window['pageManager'] = pageManager;
                try {
                    pageManager.addCSV(file.value.name, file.value.data);
                } catch (e) {
                    rejected.push(file.value.name + ': ' + e);
                    return;
                }
            });
            if (borderRef.current) borderRef.current.style.opacity = 0;
            if (spinnerRef.current) spinnerRef.current.style.opacity = 0;
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
    };

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
                renderFileProcess(event.dataTransfer.files);
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
            <div id='delete_panel_modal' className='modal'>
                <div className='modal-box'>
                    <p>Are you sure you want to delete this panel?</p>
                    <p>
                        <i id='delete_modal_name'></i>
                    </p>
                    <button
                        className='modal-btn modal-cancel-btn'
                        onClick={() =>
                            (document.getElementById('delete_panel_modal').style.display = 'none')
                        }
                    >
                        Cancel
                    </button>
                    <button
                        id='delete_modal_btn'
                        className='modal-btn delete-btn'
                        onClick={() => {}}
                    >
                        Delete
                    </button>
                </div>
            </div>
            {/* This leads to the rest of the UI components*/}
            <div className='sidebar'>
                <SidebarComp
                    renderFileProcess={renderFileProcess}
                    pageManager={pageManager}
                ></SidebarComp>
            </div>
            <div className='paner'>
                <MainPage pageManager={pageManager}></MainPage>
            </div>
        </div>
    );
}

export default App;
