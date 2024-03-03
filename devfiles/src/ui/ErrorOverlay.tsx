import { Fade } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

export default function ErrorOverlay(props: {
    message: [string, string, string][];
    visible: boolean;
    setVisible: (boolean) => void;
    autoFades: boolean;
}) {
    return (
        <Fade
            appear={true}
            timeout={1000}
            onEntered={() => {
                if (!props.autoFades) return;
                if (!props.visible) return;
                setTimeout(() => props.setVisible(false), 500);
            }}
            in={props.visible}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    pointerEvents: props.visible ? 'all' : 'none'
                }}
                onClick={props.visible ? (event) => event.stopPropagation() : undefined}
                onDragOver={
                    props.visible
                        ? (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                          }
                        : undefined
                }
                onDragLeave={
                    props.visible
                        ? (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                          }
                        : undefined
                }
                onDrop={
                    props.visible
                        ? (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                          }
                        : undefined
                }
            >
                <div className='fileUploadWarn rounded'>
                    <h4>Only CSV files exported from the BTO pipeline can be processed</h4>
                    <div style={{ display: 'flex' }}>
                        <table className='table table-danger'>
                            <thead>
                                <tr>
                                    <td>
                                        <strong>File</strong>
                                    </td>
                                    <td>
                                        <strong>Error Class</strong>
                                    </td>
                                    <td>
                                        <strong>Description</strong>
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {props.message.map(([fileName, errorClass, desc]) => (
                                    <tr key={uuidv4()}>
                                        <td style={{ textAlign: 'left' }}>{fileName}</td>
                                        <td style={{ textAlign: 'left' }}>{errorClass}</td>
                                        <td style={{ textAlign: 'left' }}>{desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!props.autoFades ? (
                        <button
                            type='button'
                            className='btn btn-danger'
                            onClick={() => props.setVisible(false)}
                        >
                            Okay
                        </button>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </Fade>
    );
}
