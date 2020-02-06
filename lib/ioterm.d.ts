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
    private color;
    private font;
    private prefix;
    private html;
    private lastLine;
    private history;
    private numRows;
    private timer;
    private charWidth;
    private charHeight;
    private isRunning;
    private commandHandler;
    constructor(parentElement: HTMLElement);
    private setStyle;
    private getLineFeedIndices;
    private autoWrap;
    private moveCursor;
    private flashCursor;
    private runCommand;
    private inputText;
    private addEventListeners;
    setColor({ text, background }: {
        text?: string;
        background?: string;
    }): void;
    setFont({ family, size }: {
        family?: string;
        size?: string;
    }): void;
    setPrefix(html: string): void;
    setCommandHandler(commandHandler: Function): void;
    end(): void;
    write(html: string): void;
}
export { escapeText, IOTerm };
