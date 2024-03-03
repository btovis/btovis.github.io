import { useState } from 'react';
import '../../App.css';
import PageManager from '../../classes/PageManager.js';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'react-bootstrap';
import InputOptionComp from './InputOptionComp.js';

/**
 * This is for the panel settings inside the sidebar.
 */
function PanelOptionsComp(params: { pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [r, dud] = useState(0);
    const refresh = () => dud(r + 1);
    params.pageManager.refreshPanelOptions = refresh;

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    //No options to display
    if (params.pageManager.selectedPanel <= -1) return <></>;

    //Render options
    const panel = params.pageManager.getSelectedPanel();
    const renderedOptions = panel
        .generateSidebar()
        .options.map((option) => <InputOptionComp key={option.uuid} inputOption={option} />);

    const deleteButton = (
        <div key={uuidv4()}>
            <button
                className='delete-btn'
                style={{ fontSize: 'larger' }}
                onClick={() => {
                    setDeleteModalVisible(true);
                    refresh();
                }}
            >
                Delete panel
            </button>
        </div>
    );

    const deleteModal = (
        <Modal show={deleteModalVisible} onHide={() => setDeleteModalVisible(false)}>
            <Modal.Header closeButton>Delete panel</Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this panel?</p>
                <p>{params.pageManager.getSelectedPanel().getName()}</p>
                <button
                    className='modal-btn modal-cancel-btn'
                    onClick={() => {
                        setDeleteModalVisible(false);
                    }}
                >
                    Cancel
                </button>
                <button
                    id='delete_modal_btn'
                    className='modal-btn delete-btn'
                    onClick={() => {
                        params.pageManager.deletePanel(params.pageManager.selectedPanel);
                        params.pageManager.unselectPanel();
                        params.pageManager.selectedPanel = -1;

                        // No longer a valid panel sidebar as there is no selected panel.
                        // Consider bundling with PageManager.unselectPanel()
                        params.pageManager.setSidebarTab('globalTab');
                        params.pageManager.refreshEverything();
                        setDeleteModalVisible(false);
                        refresh();
                    }}
                >
                    Delete
                </button>
            </Modal.Body>
        </Modal>
    );

    return (
        <div key={uuidv4()}>
            {renderedOptions}
            <br />
            {deleteButton}
            <br />
            {deleteModal}
        </div>
    );
}

export default PanelOptionsComp;
