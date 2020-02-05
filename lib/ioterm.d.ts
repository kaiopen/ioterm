declare function escapeText(strHtml: string): string;
declare class IOTerm {
    private term;
    private container;
    private htmlPanel;
    private tmpPanel;
    private measurement;
    private cursor;
    private cursorBg;
    private cursorContent;
    private input;
    private backgroundColor;
    private textColor;
    private prefix;
    private html;
    private lastLine;
    private numRows;
    private timer;
    private readonly CHARWIDTH;
    private readonly CHARHEIGHT;
    private isRunning;
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
    setPrefix(html: string): void;
    setCommandHandler(commandHandler: Function): void;
    end(): void;
    write(html: string): void;
}
export { escapeText, IOTerm };
