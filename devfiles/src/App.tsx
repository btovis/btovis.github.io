import { useRef, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SidebarComp from './ui/SidebarComp.tsx';
import MainPage from './ui/MainPage.tsx';
import PageManager from './classes/PageManager.ts';

function App() {
    const [r, dud] = useState(0);
    const [pageManager, _] = useState(new PageManager());
    pageManager.refreshEverything = () => dud(r + 1);

    const borderRef = useRef(null);
    return (
        <div
            onDragOver={(event) => {
                event.preventDefault();
                if (borderRef.current) borderRef.current.style.opacity = '80%';
            }}
            onDragExit={(event) => {
                event.preventDefault();
                if (borderRef.current) borderRef.current.style.opacity = '0%';
            }}
            onDrop={(event) => {
                event.stopPropagation();
                event.preventDefault();
                if (borderRef.current) borderRef.current.style.opacity = '0%';

                (async () => {
                    const file = event.dataTransfer.files[0];
                    if (!file.name.toLowerCase().endsWith('csv')) {
                        alert('Only CSV files from the BTO pipeline are allowed!');
                        return;
                    }
                    window['pageManager'] = pageManager;
                    console.log(event.dataTransfer.files[0]);
                    pageManager
                        .getData()
                        .addCSV(file.name, new Uint8Array(await file.arrayBuffer()));
                })().then(() => {
                    //Do feedback here to say that it was uploaded
                    console.log('Read file.');
                });
            }}
        >
            {/*Move this to App.css later*/}
            <div
                ref={borderRef}
                id='border'
                style={{
                    position: 'absolute',
                    width: '98%',
                    height: '98%',
                    left: '1%',
                    top: '1%',
                    borderStyle: 'dotted',
                    pointerEvents: 'none',
                    backgroundColor: '#eeeeee',
                    opacity: '0%'
                }}
                className='rounded'
            >
                <p>
                    <strong>Upload File</strong>
                </p>
            </div>
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
