import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';

export default class DebugWidget extends Widget {
    public generateSidebar(): Sidebar {
        return new Sidebar([]);
    }
    public render(): JSX.Element {
        console.log('DebugWidget instantiated. Row count:' + this.panel.dataFilterer.getData()[1]);
        return (
            <>
                <p>Row count: {this.panel.dataFilterer.getData()[1]}</p>
            </>
        );
    }
    public delete(): void {
        //throw new Error('Method not implemented.');
    }
    public updateTraceOptions(): void {
        throw new Error('Method not implemented.');
    }
}
