import { useState } from 'react';
import '../../App.css';
import PageManager from '../../classes/PageManager.js';
import { v4 as uuidv4 } from 'uuid';
import InputOptionComp from './InputOptionComp.js';

/**
 * This is for the panel settings inside the sidebar.
 */
function WidgetOptionsComp(params: { pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [r, dud] = useState(0);
    const refresh = () => dud(r + 1);

    params.pageManager.refreshWidgetOptions = refresh;

    //No options to display
    if (params.pageManager.selectedPanel <= -1 || params.pageManager.selectedWidget <= -1)
        return <></>;

    //Render options
    const widget = params.pageManager.getSelectedWidget();
    const renderedOptions = widget
        .generateSidebar()
        .options.map((option) => <InputOptionComp key={option.uuid} inputOption={option} />);

    return (
        <div key={uuidv4()}>
            {renderedOptions}
            <br />
        </div>
    );
}

export default WidgetOptionsComp;
