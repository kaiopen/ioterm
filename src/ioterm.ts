import { getScrollWidth, highlight } from './util';
import Tab from './tab';

interface historyItem {
    value: string,
    modification: string
}

class IOTerm {
    private term: HTMLDivElement;
    private container: HTMLDivElement;
    private main: HTMLDivElement;

    private input: HTMLInputElement;

    // The `panel` displays all highlighted text in
    // one paragraph including the text from input elements and outside ways.
    // But there is not any line feed such as '\n', '\r', '\r\n' or HTML tag
    // <br>. An additional white space will be added at the end. Every character
    // including the white space will be wrapped by an HTML tag <span>. In
    // other word, the children of the `panel` element are HTML elements
    // <span>. And in each HTML element <span> includes one character.
    private panel: HTMLDivElement;
    // The cursor is just a child of the `panel`, an HTML element <span>. By
    // changing its color, it  will look like a cursor.
    private cursor: HTMLDivElement;

    private prefix: string;
    // The `p` stores readonly highlighted text.
    private p: string;

    private isRunning: boolean;
    private commandHandler: Function;

    private textColor: string;
    private backgroundColor: string;

    private timer: any;

    private history: {
        index: number,
        items: historyItem[]
    };

    private tab: Tab;

    constructor(parentElement: HTMLElement) {
        let shadow = parentElement.attachShadow({ mode: 'closed' });

        this.term = document.createElement('div');
        this.container = document.createElement('div');
        this.main = document.createElement('div');
        shadow.append(this.term);
        this.term.append(this.container);
        this.container.append(this.main);

        this.input = document.createElement('input');
        this.main.append(this.input);
        this.panel = this.createPanel('<span>&nbsp;</span>');
        this.cursor = this.panel.children[0] as HTMLDivElement;

        this.prefix = '';
        this.p = '';
        this.isRunning = false;
        this.commandHandler = () => { this.end(); };

        this.history = {
            index: 0,
            items: [{ value: '', modification: '' }]
        };

        this.tab = new Tab(this.container);

        this.initStyle();
        this.addEventListeners();
        this.input.focus();
        this.flashCursor();
    }

    public end() {
        this.isRunning = false;
        this.write(this.prefix);
    }

    public setColor({text, background}: {text?: string, background?: string}) {
        if (text) {
            this.textColor = text;
            this.term.style.color = text;
            this.cursor.style.backgroundColor = text;
        }
        if (background) {
            this.backgroundColor = background;
            this.term.style.backgroundColor = background;
            this.cursor.style.color = background;
        }
    }

    public setCommandHandler(commandHandler: Function) {
        this.commandHandler = commandHandler;
    }

    public setFont({family, size}: {family?: string, size?: string}) {
        if (family) {
            this.term.style.fontFamily = family;
            this.input.style.fontFamily = family;
        }
        if (size) {
            this.term.style.fontSize = size;
            this.input.style.fontSize = size;
        }
    }

    public setMargin(margin: string) {
        this.term.style.margin = margin;
    }

    public setPadding(padding: string) {
        this.term.style.padding = padding;
    }

    public setPrefix(html: string) {
        this.prefix = html;
    }

    public setTabHandler(tabHandler: Function) {
        this.tab.setHandler(tabHandler);
    }

    public write(html: string) {
        // Write `html` into panel.
        // The `html` must be preprocessed by the function `highlight`.

        if (!html) {
            return;
        }

        // Automatically scroll to the bottom if the scrollbar was at the
        // bottom before writing.
        let scroll = false;
        if (
            this.term.scrollHeight -
            this.term.scrollTop -
            this.term.clientHeight <= 1
        ) {
            scroll = true;
        }

        // The value of input will also be written into the panel.
        html = highlight(this.input.value) + html;
        this.input.value = '';
        this.history.items[this.history.index].modification = '';

        // All text in one paragraph will be written into a panel. Each
        // paragraph has its own panel.
        let paragraphs = html.split('\n');
        this.panel.innerHTML = this.p + paragraphs[0];
        for (let i = 1; i < paragraphs.length; i++) {
            this.panel = this.createPanel(paragraphs[i]);
        }
        this.p = this.panel.innerHTML;
        // A space will be added for cursor.
        this.panel.innerHTML = this.p + '<span>&nbsp;</span>';
        this.updateCursor(0, 0, scroll);
    }

    private addEventListeners() {
        this.term.addEventListener('mouseup', (event) => {
            let selectionText = window.getSelection().toString();
            if (selectionText === '') {
                this.input.disabled = false;
                this.input.focus();
                this.flashCursor();
            }
        });

        this.input.addEventListener('blur', () => {
            this.input.disabled = true;
            clearInterval(this.timer);
            this.hideCursor();
        });

        this.input.addEventListener('input', (event) => {
            let text = this.input.value;
            this.history.items[this.history.index].modification = text;
            this.writeTemporarily(highlight(text));
            if (this.tab.isRunning()) {
                // Update prompts.
                this.tab.init();
                if (
                    this.tab.showPrompts(
                        this.input.value, this.input.selectionStart)
                ) {
                    this.scroll(this.term.scrollHeight);
                }
            }
        });

        this.input.addEventListener('keydown', (event) => {
            let text: string;
            let index: number;

            switch (event.keyCode) {
            case 13:  // Enter
                if (this.tab.isRunning()) {
                    this.insert(this.tab.getText());
                    this.tab.init();
                    break;
                }
                text = this.input.value;
                if (!this.isRunning) {
                    this.write('\n');
                    if (!text) {
                        index = this.history.items.length - 1;
                        this.history.index = index;
                        this.history.items[index].modification = '';
                        this.end();
                        break;
                    }
                    this.isRunning = true;

                    let len = this.history.items.length;
                    this.history.items[len - 1].value = text.trim();
                    this.history.index = len;
                    this.history.items.push({
                        value: '',
                        modification: ''
                    });
                } else {
                    if (!text) {
                        this.write('<span>&nbsp;</span>\n');
                    }
                }
                this.commandHandler(text);
                break;
            case 37:  // Left
                index = this.input.selectionStart - 1;
                if (index >= 0) {
                    this.updateCursor(index, this.input.value.length);
                }
                break;
            case 39:  // Right
                index = this.input.selectionStart + 1;
                let len = this.input.value.length;
                if (index <= len) {
                    this.updateCursor(index, len);
                }
                break;

            // History.
            case 38:  // Up
                if (this.isRunning) {
                    break;
                }
                this.showHistory(this.history.index - 1);
                break;
            case 40:  // Down
                if (this.isRunning) {
                    break;
                }
                this.showHistory(this.history.index + 1);
                break;

            case 9:  // Tab
                if (this.isRunning) {
                    break;
                }
                if (this.tab.isRunning()) {
                    this.tab.next();
                } else {
                    if (
                        this.tab.showPrompts(
                            this.input.value, this.input.selectionStart)
                    ) {
                        this.scroll(this.term.scrollHeight);
                    };
                }
                event.preventDefault();
                break;
            case 27:  // ESC
                this.tab.init();
                break;
            }
        });
    }

    private createPanel(innerHTML?: string) {
        // `innerHTML` is the highlighted text need to be shown.
        let panel = document.createElement('div');
        panel.style.width = '100%';
        if (innerHTML) {
            panel.innerHTML = innerHTML;
        }
        this.main.append(panel);
        return panel;
    }

    private flashCursor() {
        clearInterval(this.timer);
        this.showCursor();

        let i = 1;
        this.timer = setInterval(() => {
            if (i ++ % 2) {
                this.hideCursor();
            } else {
                this.showCursor();
            }
            i === 7 && (clearInterval(this.timer));
        }, 500);
    }

    private hideCursor() {
        this.cursor.style.color = 'inherit';
        this.cursor.style.backgroundColor = 'transparent';
    }

    private initStyle() {
        this.term.style.boxSizing = 'border-box'
        this.term.style.width = '100%';
        this.term.style.height = '100%';
        this.term.style.overflowX = 'hidden';
        this.term.style.overflowY = 'scroll';
        this.term.style.fontFamily = 'monospace';

        this.container.style.position = 'relative';
        this.container.style.width = 'calc(100% - ' + getScrollWidth() + 'px)';

        this.main.style.width = '100%';
        this.main.style.lineBreak = 'anywhere';

        this.input.style.position = 'absolute';
        this.input.style.top = '0';
        this.input.style.left = '0';
        this.input.style.zIndex = '-100';
        this.input.style.width = '0';
        this.input.style.border = 'none';
        this.input.style.padding = '0';

        this.setColor({ text: '#eee', background: '#2e3436' });
        this.setFont({ family: 'monospace', size: '1em' });
    }

    private insert(text: string) {
        // Insert the `text` at the cursor.

        let inputText = this.input.value;
        let position = this.input.selectionStart;
        text = inputText.substring(0, position) + text;
        let len = text.length;
        text = text + inputText.substring(position);

        this.input.value = text;
        this.input.setSelectionRange(len, len);

        this.history.items[this.history.index].modification = text;
        this.writeTemporarily(highlight(text));
    }

    private scroll(bottom: number) {
        // To make sure a object is at the bottom of view.
        // `bottom` is the distance from the bottom of the object to the top of
        // the view.

        this.term.scrollTop = bottom - this.term.clientHeight;
    }

    private showCursor() {
        this.cursor.style.color = this.backgroundColor;
        this.cursor.style.backgroundColor = this.textColor;
    }

    private showHistory(index: number) {
        let item = this.history.items[index];
        if (item) {
            this.history.index = index;
            let text = this.history.items[index].modification;
            if (!text) {
                text = item.value;
            }
            this.input.value = text;
            this.writeTemporarily(highlight(text));
        }
    }

    private updateCursor(position: number, length: number, scroll?: boolean) {
        // Restore the last cursor.
        this.hideCursor();

        // Get a new cursor.
        let children = this.panel.children;
        this.cursor = children[children.length + position - length - 1] as
            HTMLDivElement;

        let top = this.cursor.offsetTop;
        let left = this.cursor.offsetLeft;
        this.input.style.top = top + 'px';
        this.input.style.left = left + 'px';
        if (scroll !== void 0 && scroll) {
            this.scroll(top + this.cursor.offsetHeight);
        }
        this.flashCursor();
    }

    private writeTemporarily(html: string) {
        // Write the value of input.

        this.panel.innerHTML = this.p + html + '<span>&nbsp;</span>';
        this.updateCursor(this.input.selectionStart, this.input.value.length);
    }
}

export { IOTerm, highlight };
