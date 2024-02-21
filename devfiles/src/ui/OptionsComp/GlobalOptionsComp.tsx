import { MutableRefObject, useRef } from 'react';
import '../../App.css';
import PageManager from '../../classes/PageManager.js';

function GlobalOptionsComp(params: {
    renderFileProcess: (FileList) => void;
    pageManager: PageManager;
}) {
    const fileInputRef = useRef(null);
    const fileUploadTooltip = (
        <>
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
                    onChange={(event) => {
                        params.renderFileProcess(event.target.files);
                    }}
                    ref={fileInputRef}
                    type='file'
                    accept='.csv'
                    multiple
                    hidden
                />
                <button onClick={() => fileInputRef.current.click()}>Browse Files</button>
            </div>
        </>
    );

    //Check file names from the dataset
    if (params.pageManager.data.sets[0].size() <= 0) return fileUploadTooltip;

    const fileNameList = [];
    params.pageManager.data.sets[0].raws.forEach((_value, key) => {
        fileNameList.push(
            <div key={key}>
                <span>{key}</span>
                <button
                    className='btn-close'
                    onClick={() => {
                        params.pageManager.removeCSV(key);
                        params.pageManager.refreshEverything();
                    }}
                />
            </div>
        );
    });

    return (
        <>
            <div className='overflowable'>
                <h3>Data Files:</h3>
                {fileNameList}
                <hr />
                {fileUploadTooltip}
            </div>
        </>
    );
}

export default GlobalOptionsComp;
