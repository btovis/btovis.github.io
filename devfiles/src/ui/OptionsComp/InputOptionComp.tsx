import { useState } from 'react';
import InputOption from '../../classes/options/InputOption';

export default function InputOptionComp(params: { inputOption: InputOption }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [r, dud] = useState(0);
    params.inputOption.refreshComponent = () => dud(r + 1);

    //Render options
    return (
        <div
            className='inputOption'
            // key must be unique
        >
            {params.inputOption.render()}
        </div>
    );
}
