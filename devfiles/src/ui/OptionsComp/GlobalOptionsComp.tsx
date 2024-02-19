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
                    hidden
                />
                <button onClick={() => fileInputRef.current.click()}>Browse Files</button>
            </div>
        </>
    );

    return fileUploadTooltip;
}

export default GlobalOptionsComp;
