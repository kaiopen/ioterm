"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function escapeText(strHtml) {
    // Replace character '<', '>' and '&' to '&lt;', '&gt;' and '&amp;'.
    return strHtml.replace(/[<>&]/g, function (c) {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
    });
}
exports.escapeText = escapeText;
function getScrollWidth() {
    var container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.width = '100px';
    container.style.overflow = 'scroll';
    var content = document.createElement('div');
    content.style.width = '100%';
    document.body.append(container);
    container.append(content);
    var scrollWidth = container.offsetWidth - content.offsetWidth;
    content.remove();
    container.remove();
    return scrollWidth;
}
var Main = /** @class */ (function () {
    function Main(parentElement) {
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
    Main.prototype.clear = function () {
        this.panel.innerHTML = '';
        this.tmpPanel.innerHTML = '';
        this.lastLine = '';
        this.numRows = 1;
    };
    Main.prototype.setStyle = function () {
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.panel.style.width = '100%';
        this.panel.style.margin = '0';
        this.tmpPanel.style.width = '100%';
        this.tmpPanel.style.margin = '0';
    };
    return Main;
}());
var Cursor = /** @class */ (function () {
    function Cursor(parentElement) {
        this.container = document.createElement('div');
        this.background = document.createElement('div');
        this.content = document.createElement('div');
        parentElement.append(this.container);
        this.container.append(this.background, this.content);
        this.setStyle();
    }
    Cursor.prototype.flash = function () {
        var _this = this;
        clearInterval(this.timer);
        this.container.style.opacity = '1';
        var i = 1;
        this.timer = setInterval(function () {
            _this.container.style.opacity = i++ % 2 ? '0' : '1';
            i === 7 && (clearInterval(_this.timer));
        }, 500);
    };
    Cursor.prototype.move = function (top, left, width, html) {
        this.container.style.top = top + 'px';
        this.container.style.left = left + 'px';
        if (html === void 0) {
            html = '&nbsp;';
        }
        this.container.style.width = width + 'px';
        this.content.innerHTML = html;
    };
    Cursor.prototype.setStyle = function () {
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
    };
    return Cursor;
}());
var Tab = /** @class */ (function () {
    function Tab(parentElement) {
        this.container = document.createElement('div');
        this.panel = document.createElement('div');
        this.scrollContainer = document.createElement('div');
        this.count = 0;
        this.handler = function () {
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
    Tab.prototype.clear = function () {
        this.count = 0;
        this.panel.innerHTML = '';
    };
    Tab.prototype.createItem = function (prompt) {
        var item = document.createElement('div');
        item.style.display = 'inline-block';
        item.style.height = '100%';
        item.style.paddingRight = '10px';
        item.innerHTML = prompt;
        this.panel.append(item);
    };
    Tab.prototype.setStyle = function () {
        this.container.style.position = 'absolute';
        this.container.style.top = '100px';
        this.container.style.left = '5px';
        this.container.style.right = '5px';
        this.container.style.height = '3em';
        this.container.style.overflow = 'hidden';
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
    };
    return Tab;
}());
var IOTerm = /** @class */ (function () {
    function IOTerm(parentElement) {
        var _this = this;
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
        this.commandHandler = function () { _this.end(); };
        this.history = {
            index: 0,
            items: [{ value: '', modification: '' }]
        };
        this.tab = new Tab(this.container);
        this.setStyle();
        this.addEventListeners();
        this.enableInput();
        this.moveCursor(this.main.numRows, 0);
    }
    IOTerm.prototype.end = function () {
        this.isRunning = false;
        this.write(this.main.prefix);
    };
    IOTerm.prototype.refresh = function () {
        var text = this.input.value;
        var cursorPos = this.input.selectionStart;
        this.input.value = '';
        var html = this.main.panel.innerHTML + this.main.lastLine;
        html = html.replace(/<br>/g, '');
        this.main.clear();
        this.write(html);
        if (text) {
            this.inputText(text);
            this.input.value = text;
            this.input.setSelectionRange(cursorPos, cursorPos);
            var wrap = this.autoWrap(this.main.lastLine +
                escapeText(text.substring(0, cursorPos)));
            this.moveCursor(this.main.numRows + wrap.numRows - 1, wrap.colOffset, text.charAt(cursorPos));
        }
        this.enableInput();
    };
    IOTerm.prototype.setColor = function (_a) {
        var text = _a.text, background = _a.background;
        if (text) {
            this.term.style.color = text;
            this.cursor.background.style.backgroundColor = text;
        }
        if (background) {
            this.term.style.backgroundColor = background;
            this.cursor.content.style.color = background;
        }
    };
    IOTerm.prototype.setCommandHandler = function (commandHandler) {
        this.commandHandler = commandHandler;
    };
    IOTerm.prototype.setFont = function (_a) {
        var family = _a.family, size = _a.size;
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
    };
    IOTerm.prototype.setPadding = function (_a) {
        var top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left;
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
    };
    IOTerm.prototype.setPrefix = function (html) {
        this.main.prefix = html;
    };
    IOTerm.prototype.setTabHandler = function (tabHandler) {
        this.tab.handler = tabHandler;
    };
    IOTerm.prototype.write = function (html) {
        // `html` is a escaped and highlighted string that uses HTML tag <span>
        // wrapping around the text that should be highlighted and character
        // '\n' as line feed rather than <br> and '\r\n'. Note that character
        // '<' and '>' should be escaped to '&lts' and '&gt;'.
        if (!html) {
            return;
        }
        // Automatically scroll to the bottom if the scrollbar was at the
        // bottom before writing.
        var isScroll = false;
        if (this.term.scrollHeight -
            this.term.scrollTop -
            this.term.offsetHeight <= 1) {
            isScroll = true;
        }
        html = this.main.lastLine + this.input.value + html;
        this.input.value = '';
        var lines = html.split('\n');
        var lastIdx = lines.length - 1;
        var wrappedLine;
        var wrap;
        var wrappedHTML = this.main.panel.innerHTML;
        this.main.numRows--;
        if (lastIdx > 0) {
            for (var i = 0; i < lastIdx; i++) {
                wrap = this.autoWrap(lines[i]);
                wrappedHTML += wrap.wrappedHTML + '\n';
                this.main.numRows += wrap.numRows;
            }
        }
        wrap = this.autoWrap(lines[lastIdx]);
        wrappedLine = wrap.wrappedHTML;
        this.main.numRows += wrap.numRows;
        lastIdx = wrappedLine.lastIndexOf('<br>');
        if (lastIdx === -1) {
            this.main.lastLine = wrappedLine;
        }
        else {
            lastIdx += 4;
            wrappedHTML += wrappedLine.substring(0, lastIdx);
            this.main.lastLine = wrappedLine.substring(lastIdx);
        }
        this.main.panel.innerHTML = wrappedHTML;
        this.main.tmpPanel.innerHTML = this.main.lastLine;
        this.moveCursor(this.main.numRows, wrap.colOffset);
        if (isScroll) {
            this.term.scrollTop = this.term.scrollHeight;
        }
    };
    IOTerm.prototype.addEventListeners = function () {
        var _this = this;
        this.term.addEventListener('mouseup', function (event) {
            var selectionText = window.getSelection().toString();
            if (selectionText === '') {
                var scrollTop = _this.term.scrollTop;
                _this.enableInput();
                _this.cursor.flash();
                _this.term.scrollTop = scrollTop;
            }
        });
        this.term.addEventListener('copy', function (event) {
            var selectionText = window.getSelection().toString();
            if (selectionText) {
                selectionText = selectionText
                    .replace(/\r\n/g, ' ')
                    .replace(/\r/g, ' ')
                    .replace(/\n/g, ' ');
                event.clipboardData.setData('text/plain', selectionText);
            }
            event.preventDefault();
        });
        this.term.addEventListener('paste', function (event) {
            var pasteText = event.clipboardData.getData('text');
            if (pasteText) {
                pasteText = pasteText.replace(/\r\n/g, ' ')
                    .replace(/\r/g, ' ')
                    .replace(/\n/g, ' ');
                var text = _this.input.value;
                var cursorPos = _this.input.selectionStart;
                var preText = text.substring(0, cursorPos) + pasteText;
                text = preText + text.substring(cursorPos);
                _this.input.value = text;
                _this.input.setSelectionRange(preText.length, preText.length);
                _this.history.items[_this.history.index].modification = text;
                _this.inputText(text);
            }
            event.preventDefault();
        });
        this.input.addEventListener('input', function (event) {
            var text = _this.input.value;
            _this.history.items[_this.history.index].modification = text;
            _this.inputText(text);
        });
        this.input.addEventListener('blur', function () {
            // clearInterval(this.timer);
            _this.cursor.container.style.visibility = 'hidden';
            _this.input.disabled = true;
        });
        this.input.addEventListener('keydown', function (event) {
            var text;
            var index;
            var wrap;
            var item;
            switch (event.keyCode) {
                case 13: // Enter
                    _this.term.scrollTop = _this.term.scrollHeight;
                    text = _this.input.value.trim();
                    _this.input.value = '';
                    if (text) {
                        _this.write(escapeText(text) + '\n');
                        if (_this.isRunning) {
                            break;
                        }
                        _this.isRunning = true;
                        index = _this.history.index;
                        var len = _this.history.items.length;
                        _this.history.items[len - 1].value = text;
                        _this.history.items[index].modification = '';
                        _this.history.index = len;
                        _this.history.items.push({
                            value: '',
                            modification: ''
                        });
                        _this.commandHandler(text);
                    }
                    else {
                        _this.write('\n');
                        if (_this.isRunning) {
                            break;
                        }
                        var lastIndex = _this.history.items.length - 1;
                        _this.history.items[lastIndex].modification = '';
                        _this.history.index = lastIndex;
                        _this.end();
                    }
                    break;
                // Moving the cursor.
                case 37: // Left
                    index = _this.input.selectionEnd - 1;
                    if (index >= 0) {
                        text = _this.input.value;
                        wrap = _this.autoWrap(_this.main.lastLine +
                            escapeText(text.substring(0, index)));
                        _this.moveCursor(_this.main.numRows + wrap.numRows - 1, wrap.colOffset, text.charAt(index));
                    }
                    break;
                case 39: // Right
                    index = _this.input.selectionEnd + 1;
                    text = _this.input.value;
                    if (index <= text.length) {
                        wrap = _this.autoWrap(_this.main.lastLine +
                            escapeText(text.substring(0, index)));
                        _this.moveCursor(_this.main.numRows + wrap.numRows - 1, wrap.colOffset, text.charAt(index));
                    }
                    break;
                // History.
                case 38: // Up
                    index = _this.history.index - 1;
                    item = _this.history.items[index];
                    if (item) {
                        _this.history.index = index;
                        text = item.modification;
                        if (!text) {
                            text = item.value;
                        }
                        _this.input.value = text;
                        _this.inputText(text);
                    }
                    break;
                case 40: // Down
                    index = _this.history.index + 1;
                    item = _this.history.items[index];
                    if (item) {
                        _this.history.index = index;
                        text = _this.history.items[index].modification;
                        if (!text) {
                            text = item.value;
                        }
                        _this.input.value = text;
                        _this.inputText(text);
                    }
                    break;
                case 9: // Tab
                    var count = _this.tab.count;
                    var tabItem = void 0;
                    if (count === 0) {
                        var prompts = _this.tab.handler(_this.input.value.trim());
                        for (var i = 0; i < prompts.length; i++) {
                            _this.tab.createItem(prompts[i]);
                        }
                    }
                    if (count !== 0) {
                        tabItem = _this.tab.panel.children[count - 1];
                        tabItem.style.backgroundColor = 'transparent';
                    }
                    tabItem = _this.tab.panel.children[count];
                    if (tabItem) {
                        _this.tab.count = count + 1;
                    }
                    else {
                        tabItem = _this.tab.panel.children[0];
                        _this.tab.count = 1;
                    }
                    tabItem.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    event.preventDefault();
                    break;
                case 27: // ESC
                    console.log('ESC');
                    _this.tab.clear();
            }
        });
    };
    IOTerm.prototype.autoWrap = function (html) {
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
        var text = this.measurement.innerText;
        var lf = this.getLineFeedIndices(text);
        var lfIds = lf.lfIds;
        if (lfIds === []) {
            return {
                wrappedHTML: html,
                numRows: lf.numRows,
                colOffset: lf.colOffset
            };
        }
        var wrappedHTML = '';
        var i = 0;
        var length = 0;
        var isHTML = false;
        var startIdx = 0;
        var lfIdx = lfIds.shift();
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
                    }
                    else if ('&amp;' === html.substr(i, 5)) {
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
            wrappedHTML: wrappedHTML,
            numRows: lf.numRows,
            colOffset: lf.colOffset
        };
    };
    IOTerm.prototype.enableInput = function () {
        this.input.disabled = false;
        this.input.focus();
        this.cursor.container.style.visibility = 'visible';
    };
    IOTerm.prototype.getLineFeedIndices = function (text) {
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
        var startIdx = 0;
        var maxWidth = this.main.panel.offsetWidth;
        var lfIds = [];
        var subText;
        var subTextWidth;
        var endIdx;
        var line;
        var lineWidth;
        var preState = 0;
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
                }
                else if (lineWidth < maxWidth) {
                    // If a string consists of some narrow characters at
                    // the beginning and wide characters at end, such as
                    // '1234一二三四', the rough index will be smaller.
                    if (preState > 0) {
                        startIdx += endIdx;
                        lfIds.push(startIdx);
                        break;
                    }
                    else if (preState < 0) {
                        endIdx++;
                    }
                    else {
                        preState = -1;
                        endIdx++;
                    }
                }
                else {
                    if (preState < 0) {
                        startIdx += endIdx - 1;
                        lfIds.push(startIdx);
                        break;
                    }
                    else if (preState > 0) {
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
    };
    IOTerm.prototype.inputText = function (text) {
        var wrap = this.autoWrap(this.main.lastLine + escapeText(text));
        this.main.tmpPanel.innerHTML = wrap.wrappedHTML;
        var cursorPos = this.input.selectionStart;
        if (cursorPos === this.input.value.length) {
            this.moveCursor(this.main.numRows + wrap.numRows - 1, wrap.colOffset);
        }
        else {
            wrap = this.autoWrap(this.main.lastLine +
                escapeText(text.substring(0, cursorPos)));
            this.moveCursor(this.main.numRows + wrap.numRows - 1, wrap.colOffset, text.charAt(cursorPos));
        }
    };
    IOTerm.prototype.moveCursor = function (numRows, colOffset, character) {
        var charWidth;
        var charHeight;
        if (!character) {
            character = '&nbsp;';
            charWidth = this.minChar.width;
            charHeight = this.minChar.height;
        }
        else {
            this.measurement.innerHTML = character;
            charWidth = this.measurement.offsetWidth;
            charHeight = this.measurement.offsetHeight;
        }
        if (colOffset + charWidth >= this.main.panel.offsetWidth) {
            numRows += 1;
            colOffset = 0;
        }
        var top = charHeight * (numRows - 1);
        this.cursor.move(top, colOffset, charWidth, character);
        this.cursor.flash();
        // Move input box so that the input method can follow the cursor.
        this.input.style.top = top + 'px';
        this.input.style.left = colOffset + 'px';
    };
    IOTerm.prototype.setStyle = function () {
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
        this.container.style.height = 'calc(100% + 1px)';
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
    };
    return IOTerm;
}());
exports.IOTerm = IOTerm;
