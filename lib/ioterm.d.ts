import { highlight } from './util';
declare class IOTerm {
    private term;
    private container;
    private main;
    private input;
    private panel;
    private cursor;
    private prefix;
    private p;
    private isRunning;
    private commandHandler;
    private textColor;
    private backgroundColor;
    private timer;
    private history;
    private tab;
    constructor(parentElement: HTMLElement);
    end(): void;
    setColor({ text, background }: {
        text?: string;
        background?: string;
    }): void;
    setCommandHandler(commandHandler: Function): void;
    setFont({ family, size }: {
        family?: string;
        size?: string;
    }): void;
    setPrefix(html: string): void;
    setTabHandler(tabHandler: Function): void;
    write(html: string): void;
    private addEventListeners;
    private createPanel;
    private flashCursor;
    private hideCursor;
    private initStyle;
    private insert;
    private scroll;
    private showCursor;
    private showHistory;
    private updateCursor;
    private writeTemporarily;
}
export { IOTerm, highlight };
