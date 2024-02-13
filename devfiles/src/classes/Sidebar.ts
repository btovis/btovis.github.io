import InputOption from './options/InputOption';

export default class Sidebar {
    public options: InputOption[];

    public constructor(options: InputOption[]) {
        this.options = options;
    }

    /*
     * We now do rendering inside SidebarComp.tsx
     * This is because <></> cannot be typed in ts files.
     */
    // public render():JSX.Element[]{
    //     return (<></>);
    // }
}
