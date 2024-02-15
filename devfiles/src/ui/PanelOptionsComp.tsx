import { useState } from 'react';
import '../App.css';
import PageManager from '../classes/PageManager.js';

/**
 * This is for the panel settings inside the sidebar.
 */
function PanelOptionsComp(params: { pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [r, dud] = useState(0);
    const refresh = () => dud(r + 1);
    params.pageManager.refreshPanelOptions = refresh;

    //No options to display
    if (params.pageManager.selectedPanel <= -1) return <></>;

    //Render options
    const panel = params.pageManager.getSelectedPanel();
    const renderedOptions = panel
        .generateSidebar()
        .options.map((option, optionIdx) => (
            <div
                //(prime*a)+b is a hash of (a,b)
                key={23629 * params.pageManager.selectedPanel + optionIdx}
            >
                {option.render()}
            </div>
        ))
        .reduce((acc, rendered) => acc.concat(rendered), []);

    return (
        <>
            <h2>{panel.getName()}</h2>
            {renderedOptions}
        </>
    );
}

export default PanelOptionsComp;
