import { useState } from 'react';
import '../App.css';
import PageManager from '../classes/PageManager.js';

/**
 * This is for the panel settings inside the sidebar.
 */
function PanelOptionsComp(params: { pageManager: PageManager }) {
    //No options to display
    if (params.pageManager.selectedPanel <= -1) return <></>;

    //Render options
    const panel = params.pageManager.getSelectedPanel();
    const renderedOptions = panel
        .generateSidebar()
        .options.map((option) => option.render())
        .reduce((rendered, acc) => acc.concat(rendered), []);

    return (
        <>
            <h1>{panel.getName()}</h1>
            {renderedOptions}
        </>
    );
}

export default PanelOptionsComp;
