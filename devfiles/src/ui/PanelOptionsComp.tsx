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
        .options.map((option, optionIdx) => (
            <div
                // key must be unique
                key={generateHash(params, optionIdx)}
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

function generateHash(params: { pageManager: PageManager }, optionIdx: number) {
    //(prime*a)+b is a hash of (a,b)
    return 23629 * params.pageManager.selectedPanel + optionIdx;
}
