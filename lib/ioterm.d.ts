declare function escapeText(strHtml: string): string;
declare class IOTerm {
    private term;
    private container;
    private measurement;
    private input;
    private main;
    private cursor;
    private minChar;
    private isRunning;
    private commandHandler;
    private history;
    private tab;
    constructor(parentElement: HTMLElement);
    end(): void;
    refresh(): void;
    setColor({ text, background }: {
        text?: string;
        background?: string;
    }): void;
    setCommandHandler(commandHandler: Function): void;
    setFont({ family, size }: {
        family?: string;
        size?: string;
    }): void;
    setPadding({ top, right, bottom, left }: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    }): void;
    setPrefix(html: string): void;
    setTabHandler(tabHandler: Function): void;
    write(html: string): void;
    private addEventListeners;
    private autoWrap;
    private enableInput;
    private getLineFeedIndices;
    private inputText;
    private insert;
    private moveCursor;
    private moveTab;
    private scroll;
    private setStyle;
}
export { escapeText, IOTerm };
