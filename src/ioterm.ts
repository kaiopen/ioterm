// TODO:
// 1 复制时的文本处理（去除<br>导致的空格）；粘贴时对换行符的处理
// 2 resize

function escapeText(strHtml: string) {
    // Replace character '<', '>' and '&' to '&lt;', '&gt;' and '&amp;'.

    return strHtml.replace(
        /[<>&]/g,
        (c) => {
            return {'<':'&lt;', '>':'&gt;', '&': '&amp;'}[c];
        }
    );
}

class IOTerm {
    private term: HTMLElement;
    private panel: HTMLElement;

    // The element `input` moves as soon as the element `cursor` moving.
    private cursor: HTMLElement;
    private cursorContent: HTMLElement;
    private input: HTMLElement;
    private measurement: HTMLElement;

    private backgroundColor: string;
    private textColor: string;

    // `readonlyLines` consists of highlighted readonly text excluding the
    // last line which does not end with a line feed and is saved in
    // `readonlyLastLine`. In other words, `readonlyLines` ends with a line
    // feed '\n' or <br>. The editable text, the value of input element, does
    // not saved unless it becomes readonly.
    private readonlyLines: string;

    // `readonlyLastLine` saves the last line which does not end with a line
    // feed. Even an empty line is a newline.
    private readonlyLastLine: string;

    // `numRows` is the number of rows of readonly text including
    // `readonlyLines` and `readonlyLastLine`. A new line is caused by
    // character '\n' or HTML tag <br>. The initial value, 1, means the
    // `readonlyLastLine` even empty.
    private numRows: number;

    // A timer for flashing cursor.
    private timer: any;

    private CHARWIDTH: number;
    private CHARHEIGHT: number;

    private commandHandler: Function;

    constructor(parentElement: HTMLElement) {
        this.term = document.createElement('div');
        this.panel = document.createElement('pre');
        this.cursor = document.createElement('div');
        let cursorBg = document.createElement('div');
        this.cursorContent = document.createElement('div');
        this.input = document.createElement('input');
        this.measurement = document.createElement('pre');

        parentElement.append(this.term);
        this.term.append(this.measurement, this.input, this.panel, this.cursor);
        this.cursor.append(cursorBg, this.cursorContent);

        // Initialization.
        this.readonlyLines = '';
        this.readonlyLastLine = '';
        this.numRows = 1;
        this.backgroundColor = '#2e3436';
        this.textColor = '#eee';
        this.setStyle();

        this.measurement.innerHTML = '&nbsp;';
        this.CHARWIDTH = this.measurement.offsetWidth;
        this.CHARHEIGHT = this.measurement.offsetHeight;
        this.cursor.style.height = this.CHARHEIGHT + 'px';
        cursorBg.style.height = this.CHARHEIGHT - 2 + 'px';

        this.commandHandler = () => {};

        this.addEventListeners();

        this.input.focus();
        this.moveCursor(this.numRows, 0);
    }

    private setStyle() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.width = '100px';
        container.style.overflow = 'scroll';

        const content = document.createElement('div');
        content.style.width = '100%';

        document.body.append(container);
        container.append(content);
        const SCROLLWIDTH = container.offsetWidth - content.offsetWidth;
        content.remove();
        container.remove();

        this.term.style.position = 'relative';
        // The term must be able to show one widest character at least.
        // Note that different characters may be in different widths.
        this.term.style.width = '100%';
        this.term.style.minWidth = '100px';
        this.term.style.height = '100%';
        this.term.style.minHeight = '30px';
        this.term.style.backgroundColor = this.backgroundColor;
        this.term.style.fontSize = '14px';
        this.term.style.fontFamily = 'monospace';
        this.term.style.lineHeight = '1.5';
        this.term.style.overflowX = 'hidden';
        this.term.style.overflowY = 'scroll';

        this.panel.style.width = this.term.offsetWidth - SCROLLWIDTH + 'px';
        this.panel.style.height = this.term.offsetHeight + 1 + 'px';
        this.panel.style.margin = '0';
        this.panel.style.color = this.textColor;

        this.cursor.style.position = 'absolute';
        this.cursor.style.top = '0';
        this.cursor.style.left = '0';
        this.cursor.style.display = 'flex';
        this.cursor.style.alignItems = 'center';
        this.cursor.style.border = 'none';
        this.cursor.style.fontSize = '14px';
        this.cursor.style.fontFamily = 'monospace';
        this.cursor.style.lineHeight = '1.5';
        this.cursor.style.opacity = '1';

        let cursorBg = this.cursor.children[0];
        cursorBg['style'].width = '100%';
        cursorBg['style'].backgroundColor = this.textColor;

        this.cursorContent.style.position = 'absolute';
        this.cursorContent.style.top = '0';
        this.cursorContent.style.left = '0';
        this.cursorContent.style.height = '100%';
        this.cursorContent.style.color = this.backgroundColor;

        this.input.style.position = 'absolute';
        this.input.style.top = '0';
        this.input.style.left = '0';
        this.input.style.zIndex = '-100';
        this.input.style.width = '0';
        this.input.style.border = 'none';
        this.input.style.padding = '0';
        this.input.style.fontSize = '14px';
        this.input.style.fontFamily = 'monospace';
        this.input.style.lineHeight = '1.5';

        this.measurement.style.position = 'absolute';
        this.measurement.style.top = '0';
        this.measurement.style.left = '0';
        this.measurement.style.zIndex = '-100';
        this.measurement.style.margin = '0';
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
        let maxWidth = this.panel.offsetWidth;
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
            if (subTextWidth > maxWidth) {
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
            } else {
                break;
            }
        }
        return {
            lfIds: lfIds,
            // Even a empty line '' will be counted as a newline.
            numRows: 1 + lfIds.length,
            colOffset: subTextWidth
        };
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

    private moveCursor(numRows: number, colOffset: number, character?: string) {
        let charWidth: number;
        let charHeight: number;
        if (!character) {
            character = '&nbsp;';
            charWidth = this.CHARWIDTH;
            charHeight = this.CHARHEIGHT;
        } else {
            this.measurement.innerHTML = character;
            charWidth = this.measurement.offsetWidth;
            charHeight = this.measurement.offsetHeight;
        }
        if (colOffset + charWidth >= this.panel.offsetWidth) {
            numRows += 1;
            colOffset = 0;
        }
        let top = charHeight * (numRows - 1);

        // Move input cursor.
        this.cursor.style.top = top + 'px';
        this.cursor.style.left = colOffset + 'px';
        this.cursor.style.width = charWidth + 'px';
        this.cursorContent.innerHTML = character;
        this.flashCursor();

        // Move input box so that the input method can follow the cursor.
        this.input.style.top = top + 'px';
        this.input.style.left = colOffset + 'px';
    }

    private flashCursor() {
        // Flash the cursor three times.

        clearInterval(this.timer);
        this.cursor.style.opacity = '1';
        let i = 1;
        this.timer = setInterval(() => {
            this.cursor.style.opacity = i++ % 2 ? '0': '1';
            i === 7 && (clearInterval(this.timer));
        }, 500);
    }

    private addEventListeners() {
        this.term.addEventListener('mouseup', () => {
            let selectionText = window.getSelection().toString();
            if (selectionText === '') {
                let scrollTop = this.term.scrollTop;
                this.input.focus();
                this.flashCursor();
                this.term.scrollTop = scrollTop;
            }
        });

        this.input.addEventListener('input', (event) => {
            let value = event.target['value'];
            let wrap = this.autoWrap(this.readonlyLastLine + escapeText(value));
            this.panel.innerHTML = this.readonlyLines + wrap.wrappedHTML;
            let cursorPos = event.target['selectionStart'];
            if (cursorPos === value.length) {
                this.moveCursor(this.numRows + wrap.numRows - 1, wrap.colOffset)
            } else {
                wrap = this.autoWrap(
                    this.readonlyLastLine +
                    escapeText(value.substring(0, cursorPos))
                )
                this.moveCursor(
                    this.numRows + wrap.numRows - 1,
                    wrap.colOffset,
                    value.charAt(cursorPos)
                )
            }
        });
        this.input.addEventListener('blur', () => {
            clearInterval(this.timer);
            this.cursor.style.opacity = '0';
        });
        this.input.addEventListener('keydown', (event) => {
            let value: string;
            let cursorPos: number;
            let wrap: {
                wrappedHTML: string,
                numRows: number,
                colOffset: number
            }
            switch (event.keyCode) {
            case 13:  // Enter
                this.term.scrollTop = this.term.scrollHeight
                value = event.target['value'] + '\n';
                event.target['value'] = '';
                this.write(escapeText(value));
                this.commandHandler(value);
                break;
            case 37:  // Left
                cursorPos = this.input['selectionEnd'] - 1;
                if (cursorPos >= 0) {
                    value = event.target['value'];
                    wrap = this.autoWrap(
                        this.readonlyLastLine +
                        escapeText(value.substring(0, cursorPos))
                    );
                    this.moveCursor(
                        this.numRows + wrap.numRows - 1,
                        wrap.colOffset,
                        value.charAt(cursorPos)
                    )
                }
                break;
            case 39:  // Right
                cursorPos = this.input['selectionEnd'] + 1;
                value = event.target['value'];
                if (cursorPos <= value.length) {
                    wrap = this.autoWrap(
                        this.readonlyLastLine +
                        escapeText(value.substring(0, cursorPos))
                    );
                    this.moveCursor(
                        this.numRows + wrap.numRows - 1,
                        wrap.colOffset,
                        value.charAt(cursorPos)
                    )
                }
                break;
            }
        })
    }

    public setColor({text, background}: {text?: string, background?: string}) {
        if (text) {
            this.textColor = text;
        }
        if (background) {
            this.backgroundColor = background;
        }
    }

    public setCommandHandler(commandHandler: Function) {
        this.commandHandler = commandHandler;
    }

    public write(html: string) {
        // `html` is a escaped and highlighted string that uses HTML tag <span>
        // wrapping around the text that should be highlighted and character
        // '\n' as line feed rather than <br> and '\r\n'. Note that character
        // '<' and '>' should be escaped to '&lts' and '&gt;'.

        let isScroll = false;
        // Automatically scroll to the bottom if the scrollbar was at the
        // bottom before writing.
        if (
            this.term.scrollHeight -
            this.term.scrollTop -
            this.term.offsetHeight <= 1
        ) {
            isScroll = true;
        }

        html = this.readonlyLastLine + html;
        let lines = html.split('\n');
        let lastIdx = lines.length - 1;
        let wrappedLine: string;
        let wrap: { wrappedHTML: string, numRows: number, colOffset: number }

        this.numRows--;
        if (lastIdx > 0) {
            for (let i = 0; i < lastIdx; i++) {
                wrap = this.autoWrap(lines[i]);
                this.readonlyLines += wrap.wrappedHTML + '\n';
                this.numRows += wrap.numRows;
            }
        }

        wrap = this.autoWrap(lines[lastIdx])
        wrappedLine = wrap.wrappedHTML;
        this.numRows += wrap.numRows;

        lastIdx = wrappedLine.lastIndexOf('<br>');
        if (lastIdx === -1) {
            this.readonlyLastLine = wrappedLine;
        } else {
            lastIdx += 4;
            this.readonlyLines += wrappedLine.substring(0, lastIdx);
            this.readonlyLastLine = wrappedLine.substring(lastIdx);
        }
        this.panel.innerHTML = this.readonlyLines + this.readonlyLastLine;
        this.moveCursor(this.numRows, wrap.colOffset);

        if (isScroll) {
            this.term.scrollTop = this.term.scrollHeight;
        }
    }
}

export { escapeText, IOTerm };
