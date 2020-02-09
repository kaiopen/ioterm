declare function escapeText(strHtml: string): string;
declare class IOTerm {
    private term;
    private measurement;
    private input;
    private container;
    private htmlPanel;
    private tmpPanel;
    private tabPanel;
    private cursor;
    private cursorBg;
    private cursorContent;
    private prefix;
    private lastLine;
    private numRows;
    private history;
    private charWidth;
    private charHeight;
    private timer;
    private isRunning;
    private commandHandler;
    private tabHandler;
    private tabCount;
    constructor(parentElement: HTMLElement);
    end(): void;
    resize(): void;
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
    private autoWrap;
    private clearPanel;
    private enableInput;
    private flashCursor;
    private getLineFeedIndices;
    private inputText;
    private moveCursor;
    private setStyle;
}
export { escapeText, IOTerm };
