import Tooltip from '@mui/material/Tooltip';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import Panel from '../classes/Panel.js';
import PanelComp from './PanelComp.js';
import { v4 as uuidv4 } from 'uuid';

function MainPage(params: { pageManager: PageManager }) {
    return params.pageManager.panels
        .map((panel, idx) => {
            return <PanelComp key={panel.uuid} panelIdx={idx} pageManager={params.pageManager} />;
        })
        .concat(
            <Tooltip
                key={uuidv4()}
                title={params.pageManager.data.isEmpty() ? 'Add a file to start visualising!' : ''}
            >
                <span>
                    <button
                        type='button'
                        className='btn btn-primary add-panel-button'
                        id='add-panel-button'
                        key={uuidv4()}
                        disabled={params.pageManager.data.isEmpty() ? true : false}
                        onClick={() => {
                            params.pageManager.addPanel(new Panel(params.pageManager));
                            params.pageManager.refreshEverything();
                        }}
                    >
                        Add New Panel
                    </button>
                </span>
            </Tooltip>
        );
}

export default MainPage;
