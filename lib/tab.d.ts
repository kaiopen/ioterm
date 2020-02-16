declare class Tab {
    private container;
    private scrollContainer;
    private panel;
    private count;
    private handler;
    constructor(parentElement: HTMLElement);
    getText(): string;
    init(): void;
    isRunning(): boolean;
    next(): void;
    setHandler(handler: Function): void;
    showPrompts(input: string, position: number): boolean;
    private createItem;
    private initStyle;
    private scroll;
}
export default Tab;
