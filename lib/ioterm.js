"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
exports.highlight = util_1.highlight;
var tab_1 = require("./tab");
var IOTerm = /** @class */ (function () {
    function IOTerm(parentElement) {
        var _this = this;
        this.term = document.createElement('div');
        this.container = document.createElement('div');
        this.main = document.createElement('div');
        parentElement.append(this.term);
        this.term.append(this.container);
        this.container.append(this.main);
        this.input = document.createElement('input');
        this.main.append(this.input);
        this.panel = this.createPanel('<span>&nbsp;</span>');
        this.cursor = this.panel.children[0];
        this.prefix = '';
        this.p = '';
        this.isRunning = false;
        this.commandHandler = function () { _this.end(); };
        this.history = {
            index: 0,
            items: [{ value: '', modification: '' }]
        };
        this.tab = new tab_1.default(this.container);
        this.initStyle();
        this.addEventListeners();
        this.input.focus();
        this.flashCursor();
    }
    IOTerm.prototype.end = function () {
        this.isRunning = false;
        this.write(this.prefix);
    };
    IOTerm.prototype.setColor = function (_a) {
        var text = _a.text, background = _a.background;
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
    };
    IOTerm.prototype.setPrefix = function (html) {
        this.prefix = html;
    };
    IOTerm.prototype.setTabHanler = function (tabHandler) {
        this.tab.setHandler(tabHandler);
    };
    IOTerm.prototype.write = function (html) {
        if (!html) {
            return;
        }
        // Automatically scroll to the bottom if the scrollbar was at the
        // bottom before writing.
        var scroll = false;
        if (this.term.scrollHeight -
            this.term.scrollTop -
            this.term.clientHeight <= 1) {
            scroll = true;
        }
        // The value of input will also be written into the panel.
        html = util_1.highlight(this.input.value) + html;
        this.input.value = '';
        this.history.items[this.history.index].modification = '';
        // All text in one paragraph will be written into a panel. Each
        // paragraph has its own panel.
        var paragraphs = html.split('\n');
        this.panel.innerHTML = this.p + paragraphs[0];
        for (var i = 1; i < paragraphs.length; i++) {
            this.panel = this.createPanel(paragraphs[i]);
        }
        this.p = this.panel.innerHTML;
        // A space will be added for cursor.
        this.panel.innerHTML = this.p + '<span>&nbsp;</span>';
        this.updateCursor(0, 0, scroll);
    };
    IOTerm.prototype.addEventListeners = function () {
        var _this = this;
        this.term.addEventListener('mouseup', function (event) {
            var selectionText = window.getSelection().toString();
            if (selectionText === '') {
                _this.input.disabled = false;
                _this.input.focus();
                _this.flashCursor();
            }
        });
        this.input.addEventListener('blur', function () {
            _this.input.disabled = true;
            clearInterval(_this.timer);
            _this.hideCursor();
        });
        this.input.addEventListener('input', function (event) {
            var text = _this.input.value;
            _this.history.items[_this.history.index].modification = text;
            _this.writeTemporarily(util_1.highlight(text));
            if (_this.tab.isRunning()) {
                // Update prompts.
                _this.tab.init();
                if (_this.tab.showPrompts(_this.input.value, _this.input.selectionStart)) {
                    _this.scroll(_this.term.scrollHeight);
                }
            }
        });
        this.input.addEventListener('keydown', function (event) {
            var text;
            var index;
            switch (event.keyCode) {
                case 13: // Enter
                    if (_this.tab.isRunning()) {
                        _this.insert(_this.tab.getText());
                        _this.tab.init();
                        break;
                    }
                    text = _this.input.value;
                    _this.write('\n');
                    if (!_this.isRunning) {
                        if (!text) {
                            index = _this.history.items.length - 1;
                            _this.history.index = index;
                            _this.history.items[index].modification = '';
                            _this.end();
                            break;
                        }
                        _this.isRunning = true;
                        var len_1 = _this.history.items.length;
                        _this.history.items[len_1 - 1].value = text.trim();
                        _this.history.index = len_1;
                        _this.history.items.push({
                            value: '',
                            modification: ''
                        });
                    }
                    _this.commandHandler(text);
                    break;
                case 37: // Left
                    index = _this.input.selectionStart - 1;
                    if (index >= 0) {
                        _this.updateCursor(index, _this.input.value.length);
                    }
                    break;
                case 39: // Right
                    index = _this.input.selectionStart + 1;
                    var len = _this.input.value.length;
                    if (index <= len) {
                        _this.updateCursor(index, len);
                    }
                    break;
                // History.
                case 38: // Up
                    if (_this.isRunning) {
                        break;
                    }
                    _this.showHistory(_this.history.index - 1);
                    break;
                case 40: // Down
                    if (_this.isRunning) {
                        break;
                    }
                    _this.showHistory(_this.history.index + 1);
                    break;
                case 9: // Tab
                    if (_this.isRunning) {
                        break;
                    }
                    if (_this.tab.isRunning()) {
                        _this.tab.next();
                    }
                    else {
                        if (_this.tab.showPrompts(_this.input.value, _this.input.selectionStart)) {
                            _this.scroll(_this.term.scrollHeight);
                        }
                        ;
                    }
                    event.preventDefault();
                    break;
                case 27: // ESC
                    _this.tab.init();
                    break;
            }
        });
    };
    IOTerm.prototype.createPanel = function (innerHTML) {
        // `innerHTML` is the highlighted text need to be shown.
        var panel = document.createElement('div');
        panel.style.width = '100%';
        if (innerHTML) {
            panel.innerHTML = innerHTML;
        }
        this.main.append(panel);
        return panel;
    };
    IOTerm.prototype.flashCursor = function () {
        var _this = this;
        clearInterval(this.timer);
        this.showCursor();
        var i = 1;
        this.timer = setInterval(function () {
            if (i++ % 2) {
                _this.hideCursor();
            }
            else {
                _this.showCursor();
            }
            i === 7 && (clearInterval(_this.timer));
        }, 500);
    };
    IOTerm.prototype.hideCursor = function () {
        this.cursor.style.color = 'inherit';
        this.cursor.style.backgroundColor = 'transparent';
    };
    IOTerm.prototype.initStyle = function () {
        this.term.style.width = '100%';
        this.term.style.minWidth = '100px';
        this.term.style.height = '100%';
        this.term.style.minHeight = '30px';
        this.term.style.overflowX = 'hidden';
        this.term.style.overflowY = 'scroll';
        this.term.style.fontFamily = 'monospace';
        this.container.style.position = 'relative';
        this.container.style.width = 'calc(100% - ' + util_1.getScrollWidth() + 'px)';
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
        this.setFont({ family: 'monospace', size: '14px' });
    };
    IOTerm.prototype.insert = function (text) {
        // Insert the `text` at the cursor.
        var inputText = this.input.value;
        var position = this.input.selectionStart;
        text = inputText.substring(0, position) + text;
        var len = text.length;
        text = text + inputText.substring(position);
        this.input.value = text;
        this.input.setSelectionRange(len, len);
        this.history.items[this.history.index].modification = text;
        this.writeTemporarily(util_1.highlight(text));
    };
    IOTerm.prototype.scroll = function (bottom) {
        // To make sure a object is at the bottom of view.
        // `bottom` is the distance from the bottom of the object to the top of
        // the view.
        this.term.scrollTop = bottom - this.term.clientHeight;
    };
    IOTerm.prototype.showCursor = function () {
        this.cursor.style.color = this.backgroundColor;
        this.cursor.style.backgroundColor = this.textColor;
    };
    IOTerm.prototype.showHistory = function (index) {
        var item = this.history.items[index];
        if (item) {
            this.history.index = index;
            var text = this.history.items[index].modification;
            if (!text) {
                text = item.value;
            }
            this.input.value = text;
            this.writeTemporarily(util_1.highlight(text));
        }
    };
    IOTerm.prototype.updateCursor = function (position, length, scroll) {
        // Restore the last cursor.
        this.hideCursor();
        // Get a new cursor.
        var children = this.panel.children;
        this.cursor = children[children.length + position - length - 1];
        var top = this.cursor.offsetTop;
        var left = this.cursor.offsetLeft;
        this.input.style.top = top + 'px';
        this.input.style.left = left + 'px';
        if (scroll !== void 0 && scroll) {
            this.scroll(top + this.cursor.offsetHeight);
        }
        this.flashCursor();
    };
    IOTerm.prototype.writeTemporarily = function (html) {
        // Write the value of input.
        this.panel.innerHTML = this.p + html + '<span>&nbsp;</span>';
        this.updateCursor(this.input.selectionStart, this.input.value.length);
    };
    return IOTerm;
}());
exports.IOTerm = IOTerm;
