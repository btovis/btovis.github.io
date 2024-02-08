import { Dispatch, SetStateAction } from "react";

export default class PageManager {
    public updateCallback?:Dispatch<SetStateAction<PageManager>>;
}
