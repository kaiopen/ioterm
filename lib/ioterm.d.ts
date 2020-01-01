declare function escapeText(strHtml: string): string;
declare class IOTerm {
    private term;
    private panel;
    private cursor;
    private cursorContent;
    private input;
    private measurement;
    private backgroundColor;
    private textColor;
    private readonlyLines;
    private readonlyLastLine;
    private numRows;
    private timer;
    private CHARWIDTH;
    private CHARHEIGHT;
    private commandHandler;
    constructor(parentElement: HTMLElement);
    private setStyle;
    private getLineFeedIndices;
    private autoWrap;
    private moveCursor;
    private flashCursor;
    private addEventListeners;
    setColor({ text, background }: {
        text?: string;
        background?: string;
    }): void;
    setCommandHandler(commandHandler: Function): void;
    write(html: string): void;
}
export { escapeText, IOTerm };
