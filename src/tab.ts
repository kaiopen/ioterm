import { getScrollWidth } from './util';

class Tab {
    private container: HTMLDivElement;
    private scrollContainer: HTMLDivElement;
    private panel: HTMLDivElement;
    private count: number;
    private handler: Function;

    constructor(parentElement: HTMLElement) {
        this.container = document.createElement('div');
        this.scrollContainer = document.createElement('div');
        this.panel = document.createElement('div');
        this.count = 0;
        this.handler = () => {
            return [
                '<span style="color: #729fcf;">.</span>',
                '<span style="color: #729fcf;">..</span>'
            ];
        };
        parentElement.append(this.container);
        this.container.append(this.scrollContainer);
        this.scrollContainer.append(this.panel);
        this.initStyle();
    }

    public getText() {
        return (
            this.panel.children[this.count - 1] as HTMLDivElement
        ).innerText;
    }

    public init() {
        this.scroll(0);
        this.container.style.display = 'none';
        this.container.style.top = '0';
        this.count = 0;
        this.panel.innerHTML = '';
    }

    public isRunning() {
        return this.count !== 0;
    }

    public next() {
        // Point to the next prompt.

        let count = this.count;
        let children = this.panel.children;
        (children[count - 1] as HTMLDivElement)
            .style.backgroundColor = 'transparent';
        let item = children[count] as HTMLDivElement;
        let left = 0;
        if (item) {
            this.count++;
            left = item.offsetLeft;
        } else {
            item = children[0] as HTMLDivElement;
            this.count = 1;
        }
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.scroll(left);
    }

    public setHandler(handler: Function) {
        this.handler = handler;
    }

    public showPrompts(input: string, position: number) {
        let prompts = this.handler(input, position);
        if (prompts.length === 0) {
            return false;
        }
        for (let i = 0; i < prompts.length; i++) {
            this.createItem(prompts[i]);
        }
        (this.panel.children[0] as HTMLDivElement)
            .style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.count++;
        this.container.style.display = 'block';
        return true;
    }

    private createItem(html: string) {
        let item = document.createElement('div');
        item.style.display = 'inline-block';
        item.style.boxSizing = 'border-box';
        item.style.height = '100%';
        item.style.paddingRight = '2em';
        item.style.paddingLeft = '2em';
        item.innerHTML = html;
        this.panel.append(item);
    }

    private initStyle() {
        this.container.style.height = '3em';
        this.container.style.overflow = 'hidden';
        this.container.style.display = 'none';

        this.scrollContainer.style.width = '100%';
        this.scrollContainer.style.overflowX = 'scroll';
        this.scrollContainer.style.overflowY = 'hidden';
        this.scrollContainer.style.whiteSpace = 'nowrap';

        this.panel.style.display = 'inline-block';
        this.panel.style.minWidth = '100%';
        this.panel.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.panel.style.lineHeight = '3em';
    }

    private scroll(left: number) {
        this.scrollContainer.scrollLeft = left;
    }
}

export default Tab;
