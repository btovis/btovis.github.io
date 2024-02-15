import { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SidebarComp from './ui/SidebarComp.tsx';
import MainPage from './ui/MainPage.tsx';
import PageManager from './classes/PageManager.ts';

function App() {
    const [r, dud] = useState(0);
    const [pageManager, setPageManager] = useState(new PageManager());
    pageManager.refreshEverything = () => dud(r + 1);
    return (
        <>
            <div className='splitScreen'>
                <div className='sidebar'>
                    <SidebarComp pageManager={pageManager}></SidebarComp>
                </div>
                <div className='paner'>
                    <MainPage pageManager={pageManager}></MainPage>
                </div>
            </div>
        </>
    );
}

export default App;
