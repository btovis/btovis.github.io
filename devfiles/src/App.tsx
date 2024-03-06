import { useEffect, useRef, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SidebarComp from './ui/SidebarComp.tsx';
import MainPage from './ui/MainPage.tsx';
import PageManager from './classes/PageManager.ts';
import { Spinner } from 'react-bootstrap';
import Panel from './classes/Panel.ts';
import ErrorOverlay from './ui/ErrorOverlay.tsx';
import SuccessOverlay from './ui/SuccessOverlay.tsx';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/500.css';
import '@fontsource/open-sans/400-italic.css';

// https://caniuse.com/?search=es2020 "Feature support list"
// We target ES2020, 95% of browsers
if (!Promise.allSettled) {
    document.body.innerHTML =
        "BTO Pipeline CSV visualization tool has detected that you're using an outdated browser. Unfortunately this browser is not supported. Please upgrade to a newer browser. Thank you.";
}

function App() {
    const [successVisible, setSuccessVisible] = useState(false);
    const [warningVisible, setWarningVisible] = useState(false);
    const [warningMessage, setWarningMessage] = useState<[string, string, string][]>([
        ['', '', '']
    ]);
    const [r, dud] = useState(0);
    const [pageManager] = useState(PageManager.get());
    pageManager.refreshEverything = () => dud(r + 1);

    const borderRef = useRef(null);
    const spinnerRef = useRef(null);

    const renderFileProcess = (files: FileList) => {
        console.log('Enter render file proc');
        //Yes, do this AGAIN to facilitate use from GlobalOptionsComp
        if (borderRef.current) borderRef.current.style.opacity = 0.8;
        if (spinnerRef.current) spinnerRef.current.style.opacity = 1;
        if (files.length == 0) {
            if (borderRef.current) borderRef.current.style.opacity = 0;
            if (spinnerRef.current) spinnerRef.current.style.opacity = 0;
            return;
        }
        console.log('Added file:', files);
        Promise.allSettled(
            Array.prototype.map.call(files, async (file) => ({
                name: file.name,
                data: new Uint8Array(await file.arrayBuffer())
            }))
        ).then((arr) => {
            const rejected: [string, string, string][] = [];
            arr.forEach((file: PromiseFulfilledResult<{ name: string; data: Uint8Array }>) => {
                if (!file.value.name.toLowerCase().endsWith('csv')) {
                    rejected.push([file.value.name, 'Not a CSV', 'Only CSVs can be processed']);
                    return;
                }
                window['pageManager'] = pageManager;
                try {
                    pageManager.addCSV(file.value.name, file.value.data, true);
                } catch (e) {
                    rejected.push([
                        file.value.name,
                        (e as string).split(':')[0],
                        (e as string).split(':')[1]
                    ]);
                    return;
                }
            });
            pageManager.finaliseAddingCSVs();
            if (borderRef.current) borderRef.current.style.opacity = 0;
            if (spinnerRef.current) spinnerRef.current.style.opacity = 0;
            if (rejected.length > 0) setWarningMessage(rejected);
            else setWarningMessage([['Processed (' + arr.length + ') file(s)', '', '']]);
            setSuccessVisible(rejected.length <= 0);
            setWarningVisible(rejected.length > 0);

            //If there was no default panel before, add one
            if (pageManager.data.sets[0].size() > 0 && !pageManager.hasMadeDefaultPanel) {
                pageManager.addPanel(new Panel(pageManager, true));
                pageManager.hasMadeDefaultPanel = true;
                pageManager.refreshEverything();
            }
        });
    };

    AddBeforeUnloadListener(pageManager);

    return (
        <div
            onDragOver={(event) => {
                event.preventDefault();
                if (warningVisible) return;
                if (borderRef.current) borderRef.current.style.opacity = 0.8;
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                if (warningVisible) return;
                if (borderRef.current) borderRef.current.style.opacity = 0;
            }}
            onDrop={(event) => {
                event.stopPropagation();
                event.preventDefault();
                if (warningVisible) return;
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
            <SuccessOverlay
                message={warningMessage[0][0]}
                visible={successVisible}
                setVisible={setSuccessVisible}
                autoFades={true}
            />
            <ErrorOverlay
                message={warningMessage}
                setVisible={setWarningVisible}
                visible={warningVisible}
                autoFades={false}
            />
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
            {/* This is used for CSV downloads */}
            <a id='invisibleDiv'></a>
        </div>
    );
}

function AddBeforeUnloadListener(pageManager: PageManager) {
    // Add a listener for the beforeunload event - display a warning if there are unsaved changes.
    useEffect(() => {
        const onBeforeUnload = (e) => {
            const message = 'Are you sure you want to leave? All unsaved changes will be lost.';
            if (pageManager.getData().length() > 0 || pageManager.panels.length > 0) {
                e.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', onBeforeUnload);
    });
}

export default App;
