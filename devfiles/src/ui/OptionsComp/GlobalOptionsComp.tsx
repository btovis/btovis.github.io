import { useRef } from 'react';
import '../../App.css';
import PageManager from '../../classes/PageManager.js';
import { v4 as uuidv4 } from 'uuid';
import { Button } from 'react-bootstrap';

function GlobalOptionsComp(params: {
    renderFileProcess: (FileList) => void;
    pageManager: PageManager;
}) {
    const fileInputRef = useRef(null);
    const fileUploadTooltip = (
        <div>
            <div className='sidebarFileBox rounded'>
                <p>
                    <strong>Drag and drop files here</strong>
                </p>
                <table width='100%'>
                    <tbody>
                        <tr>
                            <td>
                                <hr />
                            </td>
                            <td style={{ width: '1px', padding: '0 10px', whiteSpace: 'nowrap' }}>
                                or
                            </td>
                            <td>
                                <hr />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <input
                    onClick={(event) => (event.currentTarget.value = null)}
                    onChange={(event) => {
                        params.renderFileProcess(event.target.files);
                    }}
                    ref={fileInputRef}
                    type='file'
                    accept='.csv'
                    multiple
                    hidden
                />
                <button
                    type='button'
                    className='btn btn-primary'
                    onClick={() => fileInputRef.current.click()}
                >
                    Browse Files
                </button>
            </div>
            {/* For displaying the License */}
            <Button
                style={{ float: 'left', margin: '5px' }}
                type='button'
                className='btn btn-secondary btm-sm my-3'
                onClick={() => {
                    window.open('/src/assets/license.txt', '_blank').focus();
                }}
            >
                Legal Notices
            </Button>
        </div>
    );

    //Check file names from the dataset
    if (params.pageManager.data.sets[0].size() <= 0) return fileUploadTooltip;

    const fileNameList = [];
    params.pageManager.data.sets[0].raws.forEach((_value, key) => {
        const checkboxId = uuidv4().toString();
        fileNameList.push(
            <form className='form-inline' key={key}>
                <label
                    style={{ overflowWrap: 'break-word', width: '80%' }}
                    className='form-check-label'
                    htmlFor={checkboxId}
                >
                    {key}
                </label>
                <button
                    type='button'
                    style={{ width: '10%' }}
                    id={checkboxId}
                    className='btn-close btn form-check-input'
                    onClick={() => {
                        params.pageManager.removeCSV(key);
                        params.pageManager.refreshEverything();
                    }}
                />
            </form>
        );
    });

    return (
        <div className='sidebarContainer'>
            <h3>Data Files</h3>
            {fileNameList}
            <hr />
            {fileUploadTooltip}
        </div>
    );
}

export default GlobalOptionsComp;
