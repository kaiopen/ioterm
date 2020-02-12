interface historyItem {
    value: string,
    modification: string
}

function escapeText(strHtml: string) {
    // Replace character '<', '>' and '&' to '&lt;', '&gt;' and '&amp;'.

    return strHtml.replace(
        /[<>&]/g,
        (c) => {
            return {'<':'&lt;', '>':'&gt;', '&': '&amp;'}[c];
        }
    );
}

function getScrollWidth() {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.width = '100px';
    container.style.overflow = 'scroll';

    const content = document.createElement('div');
    content.style.width = '100%';

    document.body.append(container);
    container.append(content);
    const scrollWidth = container.offsetWidth - content.offsetWidth;
    content.remove();
    container.remove();
    return scrollWidth;
}

class Main {
    public container: HTMLDivElement;

    // The element `panel` shows readonly content and `tmpPanel` shows others.
    public panel: HTMLPreElement;
    public tmpPanel: HTMLPreElement;
    public prefix: string;

    // `lastLine` saves the last lighlighted readonly line which does not end
    // with a line feed.
    public lastLine: string;

    // `numRows` is the number of rows of readonly text including `lastLine`.
    // A new line is caused by character '\n' or HTML tag <br>.
    // The initial value, 1, means the `lastLine` even empty.
    public numRows: number;

    constructor(parentElement: HTMLElement) {
        this.container = document.createElement('div');
        this.panel = document.createElement('pre');
        this.tmpPanel = document.createElement('pre');
        this.prefix = '';
        this.lastLine = '';
        this.numRows = 1;
        parentElement.append(this.container);
        this.container.append(this.panel, this.tmpPanel);
        this.setStyle();
    }

    public clear() {
        this.panel.innerHTML = '';
        this.tmpPanel.innerHTML = '';
        this.lastLine = '';
        this.numRows = 1;
    }

    private setStyle() {
        this.container.style.width = '100%';
        // this.container.style.height = '100%';
        this.panel.style.width = '100%';
        this.panel.style.margin = '0';
        this.tmpPanel.style.width = '100%';
        this.tmpPanel.style.margin = '0';
    }
}

class Cursor {
    public container: HTMLDivElement;
    public background: HTMLDivElement;
    public content: HTMLDivElement;
    private timer: any;

    constructor(parentElement: HTMLElement) {
        this.container = document.createElement('div');
        this.background = document.createElement('div');
        this.content = document.createElement('div');
        parentElement.append(this.container);
        this.container.append(this.background, this.content);
        this.setStyle();
    }

    public flash() {
        clearInterval(this.timer);
        this.container.style.opacity = '1';
        let i = 1;
        this.timer = setInterval(() => {
            this.container.style.opacity = i++ % 2 ? '0': '1';
            i === 7 && (clearInterval(this.timer));
        }, 500);
    }

    public move(top: number, left: number, width: number, html?: string) {
        this.container.style.top = top + 'px';
        this.container.style.left = left + 'px';
        if (html === void 0) {
            html = '&nbsp;';
        }
        this.container.style.width = width + 'px';
        this.content.innerHTML = html;
    }

    private setStyle() {
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.display = 'flex';
        this.container.style.alignItems = 'center';
        this.container.style.border = 'none';
        this.background.style.width = '100%';
        this.content.style.position = 'absolute';
        this.content.style.top = '0';
        this.content.style.left = '0';
        this.content.style.height = '100%';
    }
}

class Tab {
    public container: HTMLDivElement;
    public panel: HTMLDivElement;
    public count: number;
    public handler: Function;

    private scrollContainer: HTMLDivElement;

    constructor(parentElement: HTMLElement) {
        this.container = document.createElement('div');
        this.panel = document.createElement('div');
        this.scrollContainer = document.createElement('div');
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
        this.setStyle();
    }

    public init() {
        this.container.style.visibility = 'hidden';
        this.container.style.top = '0';
        this.count = 0;
        this.panel.innerHTML = '';
    }

    public move(top: number) {
        this.container.style.top = top + 'px';
    }

    public showPrompts(input: string, cursorPos: number) {
        let prompts = this.handler(input, cursorPos);
        if (!prompts) {
            return
        }
        for (let i = 0; i < prompts.length; i++) {
            this.createItem(prompts[i]);
        }
        (this.panel.children[0] as HTMLDivElement)
            .style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.count++;
        this.container.style.visibility = 'visible';
    }

    private createItem(prompt: string) {
        let item = document.createElement('div');
        item.style.display = 'inline-block';
        item.style.height = '100%';
        item.style.paddingRight = '10px';
        item.innerHTML = prompt;
        this.panel.append(item);
    }

    private setStyle() {
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '5px';
        this.container.style.right = '5px';
        this.container.style.height = '3em';
        this.container.style.overflow = 'hidden';
        this.container.style.visibility = 'hidden';

        this.scrollContainer.style.position = 'absolute';
        this.scrollContainer.style.top = '0';
        this.scrollContainer.style.bottom = 0 - getScrollWidth() + 'px';
        this.scrollContainer.style.width = '100%';
        this.scrollContainer.style.overflowX = 'scroll';
        this.scrollContainer.style.overflowY = 'hidden';

        this.panel.style.width = '100%';
        this.panel.style.height = '3em';
        this.panel.style.boxSizing = 'border-box';
        this.panel.style.paddingLeft = '10px';
        this.panel.style.paddingRight = '10px';
        this.panel.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.panel.style.lineHeight = '3em';
    }
}

class IOTerm {
    private term: HTMLDivElement;
    private container: HTMLDivElement;
    private measurement: HTMLPreElement;
    private input: HTMLInputElement;
    private main: Main;
    private cursor: Cursor;
    private  minChar: {
        width: number,
        height: number
    };
    private isRunning: boolean;
    private commandHandler: Function;
    private history: {
        index: number,
        items: historyItem[]
    };
    private tab: Tab;

    constructor(parentElement: HTMLElement)
    {
        this.term = document.createElement('div');
        this.container = document.createElement('div');
        this.measurement = document.createElement('pre');
        this.input = document.createElement('input');
        parentElement.append(this.term);
        this.term.append(this.container, this.measurement);
        this.container.append(this.input);

        this.main = new Main(this.container);
        this.cursor = new Cursor(this.container);
        this.minChar = {
            width: 0,
            height: 0
        };
        this.isRunning = false;
        this.commandHandler = () => { this.end(); };
        this.history = {
            index: 0,
            items: [{ value: '', modification: '' }]
        };
        this.tab = new Tab(this.container);

        this.setStyle();
        this.addEventListeners();
        this.enableInput();
        this.moveCursor({
            numRows: this.main.numRows,
            colOffset: 0
        });
    }

    public end() {
        this.isRunning = false;
        this.write(this.main.prefix);
    }

    public refresh() {
        let text = this.input.value;
        let cursorPos = this.input.selectionStart;
        this.input.value = '';

        let html = this.main.panel.innerHTML + this.main.lastLine;
        html = html.replace(/<br>/g, '');
        this.main.clear();
        this.write(html);

        if (text) {
            this.inputText(text);
            this.input.value = text;
            this.input.setSelectionRange(cursorPos, cursorPos);

            let wrap = this.autoWrap(
                this.main.lastLine +
                escapeText(text.substring(0, cursorPos))
            );
            this.moveCursor({
                numRows: this.main.numRows + wrap.numRows - 1,
                colOffset: wrap.colOffset,
                character: text.charAt(cursorPos)
            })
        }

        this.enableInput();
    }

    public setColor({text, background}: {text?: string, background?: string}) {
        if (text) {
            this.term.style.color = text;
            this.cursor.background.style.backgroundColor = text;
        }
        if (background) {
            this.term.style.backgroundColor = background;
            this.cursor.content.style.color = background;
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

        this.measurement.innerHTML = '&nbsp;';
        this.minChar.width = this.measurement.offsetWidth;
        this.minChar.height = this.measurement.offsetHeight;
        this.cursor.container.style.height = this.minChar.height + 'px';
        this.cursor.background.style.height = this.minChar.height - 2 + 'px';
    }

    public setPadding({top, right, bottom, left}: {
        top?: string,
        right?: string,
        bottom?: string,
        left?: string
    }) {
        if (top !== void 0) {
            this.container.style.marginTop = top;
        }
        if (right !== void 0) {
            this.container.style.marginRight = right;
        }
        if (bottom !== void 0) {
            this.container.style.marginBottom = bottom;
        }
        if (left !== void 0) {
            this.container.style.marginLeft = left;
        }
    }

    public setPrefix(html: string) {
        this.main.prefix = html;
    }

    public setTabHandler(tabHandler: Function) {
        this.tab.handler = tabHandler;
    }

    public write(html: string) {
        // `html` is a escaped and highlighted string that uses HTML tag <span>
        // wrapping around the text that should be highlighted and character
        // '\n' as line feed rather than <br> and '\r\n'. Note that character
        // '<' and '>' should be escaped to '&lts' and '&gt;'.

        if (!html) {
            return
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

        html = this.main.lastLine + this.input.value + html;
        this.input.value = '';

        let lines = html.split('\n');
        let lastIdx = lines.length - 1;
        let wrappedLine: string;
        let wrap: { wrappedHTML: string, numRows: number, colOffset: number }
        let wrappedHTML = this.main.panel.innerHTML;

        this.main.numRows--;
        if (lastIdx > 0) {
            for (let i = 0; i < lastIdx; i++) {
                wrap = this.autoWrap(lines[i]);
                wrappedHTML += wrap.wrappedHTML + '\n';
                this.main.numRows += wrap.numRows;
            }
        }

        wrap = this.autoWrap(lines[lastIdx])
        wrappedLine = wrap.wrappedHTML;
        this.main.numRows += wrap.numRows;

        lastIdx = wrappedLine.lastIndexOf('<br>');
        if (lastIdx === -1) {
            this.main.lastLine = wrappedLine;
        } else {
            lastIdx += 4;
            wrappedHTML += wrappedLine.substring(0, lastIdx);
            this.main.lastLine = wrappedLine.substring(lastIdx);
        }
        this.main.panel.innerHTML = wrappedHTML;
        this.main.tmpPanel.innerHTML = this.main.lastLine;
        this.moveCursor({
            numRows: this.main.numRows,
            colOffset: wrap.colOffset,
            scroll: scroll
        });
    }

    private addEventListeners() {
        this.term.addEventListener('mouseup', (event) => {
            let selectionText = window.getSelection().toString();
            if (selectionText === '') {
                // let scrollTop = this.term.scrollTop;
                this.enableInput();
                this.cursor.flash();
                // this.term.scrollTop = scrollTop;
            }
        });

        this.term.addEventListener('copy', (event) => {
            let selectionText = window.getSelection().toString();
            if (selectionText) {
                selectionText = selectionText
                                .replace(/\r\n/g, ' ')
                                .replace(/\r/g, ' ')
                                .replace(/\n/g, ' ');

                event.clipboardData.setData('text/plain', selectionText);
            }
            event.preventDefault();
        });

        this.term.addEventListener('paste', (event) => {
            let pasteText = event.clipboardData.getData('text');
            if (pasteText) {
                pasteText = pasteText.replace(/\r\n/g, ' ')
                                     .replace(/\r/g, ' ')
                                     .replace(/\n/g, ' ');
                this.insert(pasteText);
            }
            event.preventDefault();
        });

        this.input.addEventListener('input', (event) => {
            let text = this.input.value;
            this.history.items[this.history.index].modification = text;
            this.inputText(text);
            if (this.tab.count !== 0) {
                this.tab.init();
                this.tab.showPrompts(
                    this.input.value, this.input.selectionStart);
                this.moveTab();
            }
        });

        this.input.addEventListener('blur', () => {
            // clearInterval(this.timer);
            this.cursor.container.style.visibility = 'hidden';
            this.input.disabled = true;
        });

        this.input.addEventListener('keydown', (event) => {
            let text: string;
            let index: number;
            let wrap: {
                wrappedHTML: string,
                numRows: number,
                colOffset: number
            }
            let item: historyItem;
            let div: HTMLDivElement;

            switch (event.keyCode) {
            case 13:  // Enter
                if (this.tab.count === 0) {
                    // this.term.scrollTop = this.term.scrollHeight
                    text = this.input.value.trim();
                    this.input.value = '';
                    if (text) {
                        this.write(escapeText(text) + '\n');
                        if (this.isRunning) {
                            break;
                        }
                        this.isRunning = true;
                        index = this.history.index;
                        let len = this.history.items.length;
                        this.history.items[len - 1].value = text;
                        this.history.items[index].modification = '';
                        this.history.index = len;
                        this.history.items.push({
                            value: '',
                            modification: ''
                        });
                        this.commandHandler(text);
                    } else {
                        this.write('\n');
                        if (this.isRunning) {
                            break;
                        }
                        let lastIndex = this.history.items.length - 1;
                        this.history.items[lastIndex].modification = '';
                        this.history.index = lastIndex;
                        this.end();
                    }
                } else {
                    this.insert(
                        (this.tab.panel
                             .children[this.tab.count - 1] as HTMLDivElement
                        ).innerText
                    );
                    this.tab.init();
                }

                break;

            // Moving the cursor.
            case 37:  // Left
                index = this.input.selectionEnd - 1
                if (index >= 0) {
                    text = this.input.value;
                    wrap = this.autoWrap(
                        this.main.lastLine +
                        escapeText(text.substring(0, index))
                    );
                    this.moveCursor({
                        numRows: this.main.numRows + wrap.numRows - 1,
                        colOffset: wrap.colOffset,
                        character: text.charAt(index)
                    })
                }
                break;
            case 39:  // Right
                index = this.input.selectionEnd + 1;
                text = this.input.value;
                if (index <= text.length) {
                    wrap = this.autoWrap(
                        this.main.lastLine +
                        escapeText(text.substring(0, index))
                    );
                    this.moveCursor({
                        numRows: this.main.numRows + wrap.numRows - 1,
                        colOffset: wrap.colOffset,
                        character: text.charAt(index)
                    });
                }
                break;

            // History.
            case 38:  // Up
                index = this.history.index - 1;
                item = this.history.items[index];
                if (item) {
                    this.history.index = index;
                    text = item.modification;
                    if (!text) {
                        text = item.value;
                    }
                    this.input.value = text;
                    this.inputText(text);
                }
                break;
            case 40:  // Down
                index = this.history.index + 1;
                item = this.history.items[index];
                if (item) {
                    this.history.index = index;
                    text = this.history.items[index].modification;
                    if (!text) {
                        text = item.value;
                    }
                    this.input.value = text;
                    this.inputText(text);
                }
                break;

            case 9:  // Tab
                let count = this.tab.count;
                let tabItem: HTMLDivElement;
                if (count === 0) {
                    this.tab.showPrompts(
                        this.input.value, this.input.selectionStart);
                    this.moveTab();
                } else {
                    tabItem = (
                        this.tab.panel.children[count - 1] as HTMLDivElement);
                    tabItem.style.backgroundColor = 'transparent';

                    tabItem = (
                        this.tab.panel.children[count] as HTMLDivElement);
                    if (tabItem) {
                        this.tab.count = count + 1;
                    } else {
                        tabItem = (
                            this.tab.panel.children[0] as HTMLDivElement);
                        this.tab.count = 1;
                    }
                    tabItem.style
                           .backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }
                event.preventDefault();
                break;
            case 27:  // ESC
                console.log('ESC');
                this.tab.init();
            }
        });
    }

    private autoWrap(html: string) {
        // Insert HTML tag <br> as line feed.
        //
        // `html` is a escaped and highlighted string that excludes line feed
        // '\n', '\r\n' or HTML tag <br> and uses HTML tag <span> wrapping
        // around the text that should be highlighted. Note that character '<',
        // '>' and '&' should be escaped to '&lts', '&gt;' and '&amp;' except
        // for HTML tags.
        //
        // This function returns a string composed by `html` and some line
        // feeds.

        this.measurement.innerHTML = html;
        let text = this.measurement.innerText;
        let lf = this.getLineFeedIndices(text);
        let lfIds = lf.lfIds;
        if (lfIds === []) {
            return {
                wrappedHTML: html,
                numRows: lf.numRows,
                colOffset: lf.colOffset
            };
        }

        let wrappedHTML = '';
        let i = 0;
        let length = 0;
        let isHTML = false;
        let startIdx = 0;
        let lfIdx = lfIds.shift();
        while (true) {
            if (!lfIdx) {
                wrappedHTML += html.substring(startIdx);
                break;
            }
            switch (html.charAt(i)) {
            case '<':
                isHTML = true;
                i++;
                continue;
            case '>':
                isHTML = false;
                i++;
                continue;
            case '&':
                if (['&lt;', '&gt;'].indexOf(html.substr(i, 4)) !== -1) {
                    i += 3;
                } else if ('&amp;' === html.substr(i, 5)) {
                    i += 4;
                }
                break;
            }
            if (isHTML) {
                i++;
                continue;
            }

            length++;
            i++;
            if (length === lfIdx) {
                wrappedHTML += html.substring(startIdx, i) + '<br>';
                startIdx = i;
                lfIdx = lfIds.shift();
            }
        }
        return {
            wrappedHTML,
            numRows: lf.numRows,
            colOffset: lf.colOffset
        };
    }

    private enableInput() {
        this.input.disabled = false;
        this.input.focus();
        this.cursor.container.style.visibility = 'visible';
    }

    private getLineFeedIndices(text: string) {
        // Find the index where to insert line feeds in the string `text`.
        //
        // This function returns a object containing `lfIds`, `numRows` and
        // 'colOffset'. `lfIds` is an array recording the indices where to
        // insert line feeds in the string `text`. `numRows` is the number of
        // rows after `text` is inserted with line feeds <br>. 'colOffset' is
        // the width in pixel of the last line after `text` is inserted with
        // line feeds <br>.

        // `startIdx` is the starting index of string `subText` in string
        // `text`.
        let startIdx = 0;
        let maxWidth = this.main.panel.offsetWidth;
        let lfIds: number[] = [];

        let subText: string;
        let subTextWidth: number;
        let endIdx: number;
        let line: string;
        let lineWidth: number;
        let preState = 0;
        // In each iteration, find a line whose length is less than `maxWidth`.
        // Do not insert the line feed <br> into the last line even if its
        // length is equal to `maxWidth`.
        while (true) {
            subText = text.substring(startIdx);
            this.measurement.innerHTML = escapeText(subText);
            subTextWidth = this.measurement.offsetWidth;
            if (subTextWidth <= maxWidth) {
                break;
            }

            // `endIdx` computed here is a rough index where to insert a
            // linefeed in string `subText`. And it is also the number of
            // characters.
            endIdx = Math.floor(subText.length * maxWidth / subTextWidth);

            // For an exact index, it is necessary to compare the
            // relationship between the rough index and its consecutive
            // indices.
            preState = 0;
            while (true) {
                // line = text.substring(startIdx, startIdx + endIdx);
                line = subText.substring(0, endIdx);
                this.measurement.innerHTML = escapeText(line);
                lineWidth = this.measurement.offsetWidth;
                if (lineWidth === maxWidth) {
                    // `endIdx` here is the exact index where to insert a
                    // linefeed in string `subText'. Also, `startIdx`
                    // computed here is an exact index where to insert a
                    // linefeed in string `text`.
                    startIdx += endIdx;
                    lfIds.push(startIdx);
                    break;
                } else if (lineWidth < maxWidth) {
                    // If a string consists of some narrow characters at
                    // the beginning and wide characters at end, such as
                    // '1234一二三四', the rough index will be smaller.
                    if (preState > 0) {
                        startIdx += endIdx;
                        lfIds.push(startIdx);
                        break;
                    } else if (preState < 0) {
                        endIdx++;
                    } else {
                        preState = -1;
                        endIdx++;
                    }
                } else {
                    if (preState < 0) {
                        startIdx += endIdx - 1;
                        lfIds.push(startIdx);
                        break;
                    } else if (preState > 0) {
                        endIdx--;
                    }
                    else {
                        preState = 1;
                        endIdx--;
                    }
                }
            }
        }
        return {
            lfIds: lfIds,
            // Even a empty line '' will be counted as a newline.
            numRows: 1 + lfIds.length,
            colOffset: subTextWidth
        };
    }

    private inputText(text: string) {
        let wrap = this.autoWrap(this.main.lastLine + escapeText(text));
        this.main.tmpPanel.innerHTML = wrap.wrappedHTML;

        let cursorPos = this.input.selectionStart;
        if (cursorPos === this.input.value.length) {
            this.moveCursor({
                numRows: this.main.numRows + wrap.numRows - 1,
                colOffset: wrap.colOffset
            });
        } else {
            wrap = this.autoWrap(
                this.main.lastLine +
                escapeText(text.substring(0, cursorPos))
            );
            this.moveCursor({
                numRows: this.main.numRows + wrap.numRows - 1,
                colOffset: wrap.colOffset,
                character: text.charAt(cursorPos)
            });
        }
    }

    private insert(html: string) {
        let text = this.input.value;
        let cursorPos = this.input.selectionStart;
        let preText = text.substring(0, cursorPos) + html;
        text = preText + text.substring(cursorPos);
        this.input.value = text;
        this.input.setSelectionRange(preText.length, preText.length);

        this.history.items[this.history.index].modification = text;

        this.inputText(text);
    }

    private moveCursor({numRows, colOffset, character, scroll}: {
        numRows: number,
        colOffset: number,
        character?: string,
        scroll?: boolean
    }) {
        let charWidth: number;
        if (!character) {
            character = '&nbsp;';
            charWidth = this.minChar.width;
        } else {
            this.measurement.innerHTML = character;
            charWidth = this.measurement.offsetWidth;
        }
        if (colOffset + charWidth >= this.main.panel.offsetWidth) {
            numRows += 1;
            colOffset = 0;
        }
        let top = this.minChar.height * (numRows - 1);

        this.cursor.move(top, colOffset, charWidth, character);
        this.cursor.flash();

        // Move input box so that the input method can follow the cursor.
        this.input.style.top = top + 'px';
        this.input.style.left = colOffset + 'px';

        if (scroll === void 0 || scroll) {
            this.scroll(top + this.minChar.height + 1);
        }
    }

    private moveTab() {
        this.tab.move(
            this.main.panel.offsetHeight + this.main.tmpPanel.offsetHeight);
    }

    private scroll(bottom?: number) {
        // `bottom` is the position at the bottom of the view.
        if (bottom === void 0) {
            bottom = this.term.scrollHeight;
        }
        this.term.scrollTop = bottom - this.term.clientHeight;
    }

    private setStyle() {
        this.term.style.position = 'relative';
        // The term must be able to show one widest character at least.
        // Note that different characters may be in different widths.
        this.term.style.width = '100%';
        this.term.style.minWidth = '100px';
        this.term.style.height = '100%';
        this.term.style.minHeight = '30px';
        this.term.style.lineHeight = '1.5';
        this.term.style.overflowX = 'hidden';
        this.term.style.overflowY = 'scroll';

        this.container.style.position = 'relative';
        this.container.style.width = 'calc(100% - ' + getScrollWidth() + 'px)';
        // this.container.style.height = '100%';

        this.measurement.style.position = 'absolute';
        this.measurement.style.top = '0';
        this.measurement.style.left = '0';
        this.measurement.style.zIndex = '-100';
        this.measurement.style.margin = '0';

        this.input.style.position = 'absolute';
        this.input.style.top = '0';
        this.input.style.left = '0';
        this.input.style.zIndex = '-100';
        this.input.style.width = '0';
        this.input.style.border = 'none';
        this.input.style.padding = '0';
        this.input.style.lineHeight = '1.5';

        this.setColor({
            text: '#eee',
            background: '#2e3436'
        });
        this.setFont({
            family: 'monospace',
            size: '14px'
        });
    }
}

export { escapeText, IOTerm };
