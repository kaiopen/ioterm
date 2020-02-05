"use strict";
// TODO:
// 1 复制时的文本处理（去除<br>导致的空格）；粘贴时对换行符的处理
// 2 resize
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
var IOTerm = /** @class */ (function () {
    function IOTerm(parentElement) {
        this.term = document.createElement('div');
        this.container = document.createElement('div');
        this.htmlPanel = document.createElement('pre');
        this.tmpPanel = document.createElement('pre');
        this.measurement = document.createElement('pre');
        this.cursor = document.createElement('div');
        this.cursorBg = document.createElement('div');
        this.cursorContent = document.createElement('div');
        this.input = document.createElement('input');
        parentElement.append(this.term);
        this.term.append(this.measurement, this.cursor, this.input, this.container);
        this.cursor.append(this.cursorBg, this.cursorContent);
        this.container.append(this.htmlPanel, this.tmpPanel);
        // Initialization.
        this.prefix = '';
        this.html = '';
        this.lastLine = '';
        this.numRows = 1;
        this.backgroundColor = '';
        this.textColor = '';
        this.setStyle();
        this.measurement.innerHTML = '&nbsp;';
        this.CHARWIDTH = this.measurement.offsetWidth;
        this.CHARHEIGHT = this.measurement.offsetHeight;
        this.cursor.style.height = this.CHARHEIGHT + 'px';
        this.cursorBg.style.height = this.CHARHEIGHT - 2 + 'px';
        this.commandHandler = function () { };
        this.addEventListeners();
        this.input.focus();
        this.moveCursor(this.numRows, 0);
    }
    IOTerm.prototype.setStyle = function () {
        this.term.style.position = 'relative';
        // The term must be able to show one widest character at least.
        // Note that different characters may be in different widths.
        this.term.style.width = '100%';
        this.term.style.minWidth = '100px';
        this.term.style.height = '100%';
        this.term.style.minHeight = '30px';
        this.term.style.fontSize = '14px';
        this.term.style.fontFamily = 'monospace';
        this.term.style.lineHeight = '1.5';
        this.term.style.overflowX = 'hidden';
        this.term.style.overflowY = 'scroll';
        this.measurement.style.position = 'absolute';
        this.measurement.style.top = '0';
        this.measurement.style.left = '0';
        this.measurement.style.zIndex = '-100';
        this.measurement.style.margin = '0';
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
        this.cursorBg.style.width = '100%';
        this.cursorContent.style.position = 'absolute';
        this.cursorContent.style.top = '0';
        this.cursorContent.style.left = '0';
        this.cursorContent.style.height = '100%';
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
        var scrollWidth = getScrollWidth();
        this.container.style.width = this.term.offsetWidth - scrollWidth + 'px';
        this.container.style.height = this.term.offsetHeight + 1 + 'px';
        this.htmlPanel.style.width = '100%';
        this.htmlPanel.style.margin = '0';
        this.tmpPanel.style.width = '100%';
        this.tmpPanel.style.margin = '0';
        this.setColor({
            text: '#eee',
            background: '#2e3436'
        });
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
        var maxWidth = this.htmlPanel.offsetWidth;
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
            else {
                break;
            }
        }
        return {
            lfIds: lfIds,
            // Even a empty line '' will be counted as a newline.
            numRows: 1 + lfIds.length,
            colOffset: subTextWidth
        };
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
    IOTerm.prototype.moveCursor = function (numRows, colOffset, character) {
        var charWidth;
        var charHeight;
        if (!character) {
            character = '&nbsp;';
            charWidth = this.CHARWIDTH;
            charHeight = this.CHARHEIGHT;
        }
        else {
            this.measurement.innerHTML = character;
            charWidth = this.measurement.offsetWidth;
            charHeight = this.measurement.offsetHeight;
        }
        if (colOffset + charWidth >= this.htmlPanel.offsetWidth) {
            numRows += 1;
            colOffset = 0;
        }
        var top = charHeight * (numRows - 1);
        // Move input cursor.
        this.cursor.style.top = top + 'px';
        this.cursor.style.left = colOffset + 'px';
        this.cursor.style.width = charWidth + 'px';
        this.cursorContent.innerHTML = character;
        this.flashCursor();
        // Move input box so that the input method can follow the cursor.
        this.input.style.top = top + 'px';
        this.input.style.left = colOffset + 'px';
    };
    IOTerm.prototype.flashCursor = function () {
        // Flash the cursor three times.
        var _this = this;
        clearInterval(this.timer);
        this.cursor.style.opacity = '1';
        var i = 1;
        this.timer = setInterval(function () {
            _this.cursor.style.opacity = i++ % 2 ? '0' : '1';
            i === 7 && (clearInterval(_this.timer));
        }, 500);
    };
    IOTerm.prototype.addEventListeners = function () {
        var _this = this;
        this.term.addEventListener('mouseup', function () {
            var selectionText = window.getSelection().toString();
            if (selectionText === '') {
                var scrollTop = _this.term.scrollTop;
                _this.input.focus();
                _this.flashCursor();
                _this.term.scrollTop = scrollTop;
            }
        });
        this.term.addEventListener('copy', function (event) {
            var selectionText = window.getSelection().toString();
            selectionText = selectionText
                .replace(/\r\n/g, '')
                .replace(/\r/g, '')
                .replace(/\n/g, '');
            event.clipboardData.setData('text/plain', selectionText);
            event.preventDefault();
        });
        this.term.addEventListener('paste', function (event) {
            var text = event.clipboardData.getData('text');
            text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            var line = text.split('\n')[0];
            _this.write(escapeText(line + '\n'));
            if (!_this.isRunning) {
                _this.isRunning = true;
                _this.commandHandler(line);
            }
            event.preventDefault();
        });
        this.input.addEventListener('input', function (event) {
            var value = event.target['value'];
            var wrap = _this.autoWrap(_this.lastLine + escapeText(value));
            _this.tmpPanel.innerHTML = wrap.wrappedHTML;
            var cursorPos = event.target['selectionStart'];
            if (cursorPos === value.length) {
                _this.moveCursor(_this.numRows + wrap.numRows - 1, wrap.colOffset);
            }
            else {
                wrap = _this.autoWrap(_this.lastLine +
                    escapeText(value.substring(0, cursorPos)));
                _this.moveCursor(_this.numRows + wrap.numRows - 1, wrap.colOffset, value.charAt(cursorPos));
            }
        });
        this.input.addEventListener('blur', function () {
            clearInterval(_this.timer);
            _this.cursor.style.opacity = '0';
        });
        this.input.addEventListener('keydown', function (event) {
            var value;
            var cursorPos;
            var wrap;
            switch (event.keyCode) {
                case 13: // Enter
                    _this.term.scrollTop = _this.term.scrollHeight;
                    value = event.target.value;
                    event.target.value = '';
                    _this.write(escapeText(value + '\n'));
                    if (!_this.isRunning) {
                        _this.isRunning = true;
                        _this.commandHandler(value);
                    }
                    break;
                case 37: // Left
                    cursorPos = _this.input['selectionEnd'] - 1;
                    if (cursorPos >= 0) {
                        value = event.target.value;
                        wrap = _this.autoWrap(_this.lastLine +
                            escapeText(value.substring(0, cursorPos)));
                        _this.moveCursor(_this.numRows + wrap.numRows - 1, wrap.colOffset, value.charAt(cursorPos));
                    }
                    break;
                case 39: // Right
                    cursorPos = _this.input['selectionEnd'] + 1;
                    value = event.target.value;
                    if (cursorPos <= value.length) {
                        wrap = _this.autoWrap(_this.lastLine +
                            escapeText(value.substring(0, cursorPos)));
                        _this.moveCursor(_this.numRows + wrap.numRows - 1, wrap.colOffset, value.charAt(cursorPos));
                    }
                    break;
            }
        });
    };
    IOTerm.prototype.setColor = function (_a) {
        var text = _a.text, background = _a.background;
        if (text) {
            this.textColor = text;
        }
        if (background) {
            this.backgroundColor = background;
        }
        this.term.style.backgroundColor = this.backgroundColor;
        this.term.style.color = this.textColor;
        this.cursorBg.style.backgroundColor = this.textColor;
        this.cursorContent.style.color = this.backgroundColor;
    };
    IOTerm.prototype.setPrefix = function (html) {
        this.prefix = html;
    };
    IOTerm.prototype.setCommandHandler = function (commandHandler) {
        this.commandHandler = commandHandler;
    };
    IOTerm.prototype.end = function () {
        this.isRunning = false;
        this.write(this.prefix);
    };
    IOTerm.prototype.write = function (html) {
        // `html` is a escaped and highlighted string that uses HTML tag <span>
        // wrapping around the text that should be highlighted and character
        // '\n' as line feed rather than <br> and '\r\n'. Note that character
        // '<' and '>' should be escaped to '&lts' and '&gt;'.
        var isScroll = false;
        // Automatically scroll to the bottom if the scrollbar was at the
        // bottom before writing.
        if (this.term.scrollHeight -
            this.term.scrollTop -
            this.term.offsetHeight <= 1) {
            isScroll = true;
        }
        html = this.lastLine + this.input.value + html;
        this.input.value = '';
        var lines = html.split('\n');
        var lastIdx = lines.length - 1;
        var wrappedLine;
        var wrap;
        this.numRows--;
        if (lastIdx > 0) {
            for (var i = 0; i < lastIdx; i++) {
                wrap = this.autoWrap(lines[i]);
                this.html += wrap.wrappedHTML + '\n';
                this.numRows += wrap.numRows;
            }
        }
        wrap = this.autoWrap(lines[lastIdx]);
        wrappedLine = wrap.wrappedHTML;
        this.numRows += wrap.numRows;
        lastIdx = wrappedLine.lastIndexOf('<br>');
        if (lastIdx === -1) {
            this.lastLine = wrappedLine;
        }
        else {
            lastIdx += 4;
            this.html += wrappedLine.substring(0, lastIdx);
            this.lastLine = wrappedLine.substring(lastIdx);
        }
        this.htmlPanel.innerHTML = this.html;
        this.tmpPanel.innerHTML = this.lastLine;
        this.moveCursor(this.numRows, wrap.colOffset);
        if (isScroll) {
            this.term.scrollTop = this.term.scrollHeight;
        }
    };
    return IOTerm;
}());
exports.IOTerm = IOTerm;
