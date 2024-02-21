import { useState } from 'react';
import '../../App.css';
import PageManager from '../../classes/PageManager.js';
import generateHash from '../../utils/generateHash.js';

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
                // key must be unique
                key={generateHash(params.pageManager.selectedPanel, optionIdx)}
            >
                {option.render()}
            </div>
        ))
        .reduce((acc, rendered) => acc.concat(rendered), []);

    // TODO: Display panel name to be deleted
    const deleteButton = (
        <div>
            <button
                className='delete-btn'
                onClick={() => {
                    document.getElementById('delete_panel_modal').style.display = 'block';
                    document.getElementById('delete_modal_name').innerText = params.pageManager
                        .getSelectedPanel()
                        .getName();
                    document.getElementById('delete_modal_btn').onclick = () => {
                        params.pageManager.deletePanel(params.pageManager.selectedPanel);
                        params.pageManager.unselectPanel();
                        params.pageManager.selectedPanel = -1;

                        // No longer a valid panel sidebar as there is no selected panel.
                        // Consider bundling with PageManager.unselectPanel()
                        params.pageManager.setSidebarTab('globalTab');
                        params.pageManager.refreshEverything();
                        document.getElementById('delete_panel_modal').style.display = 'none';
                    };
                }}
            >
                Delete panel
            </button>
        </div>
    );

    return (
        <>
            <h2>{panel.getName()}</h2>
            {renderedOptions}
            {deleteButton}
        </>
    );
}

export default PanelOptionsComp;
