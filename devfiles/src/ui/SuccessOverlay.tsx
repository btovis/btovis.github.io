import { Fade } from 'react-bootstrap';

export default function SuccessOverlay(props: {
    visible: boolean;
    message: string;
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
                style={{ width: '100%', height: '100%' }}
                onClick={(event) => event.stopPropagation()}
                onDragOver={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
            >
                <div className={'fileUploadSuccess rounded'}>
                    <div style={{ display: 'flex' }}>
                        <table>
                            <tbody>
                                <tr>
                                    <td>{props.message}</td>
                                </tr>
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
