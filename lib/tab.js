"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tab = /** @class */ (function () {
    function Tab(parentElement) {
        this.container = document.createElement('div');
        this.scrollContainer = document.createElement('div');
        this.panel = document.createElement('div');
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
        this.initStyle();
    }
    Tab.prototype.getText = function () {
        return this.panel.children[this.count - 1].innerText;
    };
    Tab.prototype.init = function () {
        this.container.style.display = 'none';
        this.container.style.top = '0';
        this.count = 0;
        this.panel.innerHTML = '';
    };
    Tab.prototype.isRunning = function () {
        return this.count !== 0;
    };
    Tab.prototype.next = function () {
        // Point to the next prompt.
        var count = this.count;
        var children = this.panel.children;
        children[count - 1]
            .style.backgroundColor = 'transparent';
        var item = children[count];
        var left = 0;
        if (item) {
            this.count++;
            left = item.offsetLeft;
        }
        else {
            item = children[0];
            this.count = 1;
        }
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.scroll(left);
    };
    Tab.prototype.setHandler = function (handler) {
        this.handler = handler;
    };
    Tab.prototype.showPrompts = function (input, position) {
        var prompts = this.handler(input, position);
        if (prompts.length === 0) {
            return false;
        }
        for (var i = 0; i < prompts.length; i++) {
            this.createItem(prompts[i]);
        }
        this.panel.children[0]
            .style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.count++;
        this.scroll(0);
        this.container.style.display = 'block';
        return true;
    };
    Tab.prototype.createItem = function (html) {
        var item = document.createElement('div');
        item.style.display = 'inline-block';
        item.style.boxSizing = 'border-box';
        item.style.height = '100%';
        item.style.paddingRight = '2em';
        item.style.paddingLeft = '2em';
        item.innerHTML = html;
        this.panel.append(item);
    };
    Tab.prototype.initStyle = function () {
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
    };
    Tab.prototype.scroll = function (left) {
        this.scrollContainer.scrollLeft = left;
    };
    return Tab;
}());
exports.default = Tab;
