import React from 'react';
import Query from '../query/Query';
import InputOption from './InputOption';

export default class TextInput extends InputOption {
    private text: string = '';
    public render(): JSX.Element[] {
        return [
            <input
                name={this.name}
                defaultValue={this.text}
                onBlur={(e) => this.callback(e.target.value)}
                onKeyUp={(e) => {
                    if (e.key == 'Enter') {
                        this.callback(e.currentTarget.value);
                        e.currentTarget.blur();
                    }
                }}
            />
        ];
    }
    public callback(newValue: any): void {
        this.text = newValue;
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
    public value(): string {
        return this.text;
    }
}
