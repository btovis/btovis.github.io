import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import PanelComp from './PanelComp.js';

function MainPage(params: { pageManager: PageManager }) {
    return [
        <>
            <div>
                <a href='https://vitejs.dev' target='_blank'>
                    <img src={viteLogo} className='logo' alt='Vite logo' />
                </a>
                <a href='https://react.dev' target='_blank'>
                    <img src={reactLogo} className='logo react' alt='React logo' />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className='card'>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className='read-the-docs'>Click on the Vite and React logos to learn more.</p>
        </>
    ].concat(
        params.pageManager.panels.map((_, index) => {
            return (
                <>
                    <PanelComp panelIdx={index} pageManager={params.pageManager} />
                </>
            );
        })
    );
}

export default MainPage;
